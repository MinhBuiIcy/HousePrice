from __future__ import annotations

import argparse
import csv
import random
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import requests


API = "https://gateway.chotot.com/v1/public/ad-listing"


DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile)",
    "Accept": "application/json",
}


@dataclass(frozen=True)
class CrawlConfig:
    region_v2: int
    start_page: int
    limit_pages: int
    batch_pages: int
    limit_per_page: int
    min_sleep_s: float
    max_sleep_s: float
    timeout_s: float


def _now_tag() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def _polite_sleep(min_s: float, max_s: float) -> None:
    if max_s <= 0:
        return
    if min_s < 0:
        min_s = 0
    if max_s < min_s:
        max_s = min_s
    time.sleep(random.uniform(min_s, max_s))


def _fetch_ads(
    session: requests.Session,
    *,
    region_v2: int,
    offset: int,
    limit: int,
    timeout_s: float,
) -> Dict[str, Any]:
    params = {"region_v2": region_v2, "cg": 1000, "o": offset, "limit": limit}
    r = session.get(API, params=params, timeout=timeout_s)
    r.raise_for_status()
    data = r.json()
    if not isinstance(data, dict):
        raise ValueError("Unexpected API response (not a JSON object)")
    return data


def _extract_item(ad: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": ad.get("ad_id"),
        "title": ad.get("subject"),
        "price": ad.get("price"),
        "area": ad.get("size"),
        "date": ad.get("list_time"),
        "city": ad.get("region_name"),
        "district": ad.get("area_name"),
        "ward": ad.get("ward_name"),
        "street": ad.get("street_name"),
        "address": ad.get("address"),
        "lat": ad.get("latitude"),
        "lng": ad.get("longitude"),
        "body": ad.get("body"),
        "rooms": ad.get("rooms"),
        "toilets": ad.get("toilets"),
        "floors": ad.get("floors"),
        "legal": ad.get("property_legal_document"),
        "furniture": ad.get("furnishing_sell"),
        "house_type": ad.get("property_road_type"),
        "direction": ad.get("direction"),
        "living_size": ad.get("living_size"),
        "seller_type": ad.get("company_ad", False),
        "protection": ad.get("protection_entitlement"),
        "image_count": len(ad.get("images", []) or []),
        "image_thumb": ad.get("image"),
        "property_type": ad.get("property_type"),
        "width": ad.get("width"),
        "length": ad.get("length"),
        "num_floors": ad.get("num_floors"),
        "alley_width": ad.get("alley_width"),
        "pty_characteristics": ad.get("pty_characteristics"),
        "owner_type": ad.get("company_ad"),
        "is_pro": ad.get("company_ad", False),
        "verified": ad.get("protection_entitlement"),
    }


def crawl_chotot_items(cfg: CrawlConfig, *, headers: Optional[Dict[str, str]] = None) -> Iterable[Dict[str, Any]]:
    session = requests.Session()
    session.headers.update(DEFAULT_HEADERS)
    if headers:
        session.headers.update(headers)

    for p in range(cfg.start_page, cfg.start_page + cfg.limit_pages):
        offset = p * cfg.limit_per_page
        data = _fetch_ads(
            session,
            region_v2=cfg.region_v2,
            offset=offset,
            limit=cfg.limit_per_page,
            timeout_s=cfg.timeout_s,
        )
        ads = data.get("ads", [])
        if not ads:
            break
        if not isinstance(ads, list):
            raise ValueError("Unexpected API response: 'ads' is not a list")

        for ad in ads:
            if isinstance(ad, dict):
                item = _extract_item(ad)
                item["page"] = p
                yield item

        _polite_sleep(cfg.min_sleep_s, cfg.max_sleep_s)


def write_csv(path: Path, rows: List[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    keys: List[str] = []
    seen = set()
    for r in rows:
        for k in r.keys():
            if k not in seen:
                seen.add(k)
                keys.append(k)

    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        w.writerows(rows)


def run_batched(cfg: CrawlConfig, *, out_dir: Path, out_prefix: str = "chotot") -> List[Path]:
    written: List[Path] = []
    batch_rows: List[Dict[str, Any]] = []

    batch_start_page = cfg.start_page
    last_seen_page: Optional[int] = None

    def flush() -> None:
        nonlocal batch_rows, written, batch_start_page, last_seen_page
        if not batch_rows:
            return
        end_page = last_seen_page if last_seen_page is not None else (batch_start_page + cfg.batch_pages - 1)
        out_path = out_dir / f"{out_prefix}_region{cfg.region_v2}_p{batch_start_page}-{end_page}_{_now_tag()}.csv"
        write_csv(out_path, batch_rows)
        written.append(out_path)
        batch_rows = []
        batch_start_page = (end_page + 1)
        last_seen_page = None

    for item in crawl_chotot_items(cfg):
        batch_rows.append(item)
        p = item.get("page")
        if isinstance(p, int):
            last_seen_page = p
            pages_in_batch = (p - batch_start_page + 1)
            if pages_in_batch >= cfg.batch_pages:
                flush()

    flush()
    return written


def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Crawl Chợ Tốt API and checkpoint CSV every N pages.")
    p.add_argument("--region", type=int, required=True, help="region_v2 (e.g. 13000)")
    p.add_argument("--start-page", type=int, default=0)
    p.add_argument("--limit-pages", type=int, default=200)
    p.add_argument("--batch-pages", type=int, default=200, help="Write 1 CSV per N pages")
    p.add_argument("--limit-per-page", type=int, default=20)
    p.add_argument("--min-sleep", type=float, default=1.0)
    p.add_argument("--max-sleep", type=float, default=3.0)
    p.add_argument("--timeout", type=float, default=30.0)
    p.add_argument("--out-dir", default="data")
    p.add_argument("--out-prefix", default="chotot")
    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = build_arg_parser().parse_args(argv)
    cfg = CrawlConfig(
        region_v2=args.region,
        start_page=args.start_page,
        limit_pages=args.limit_pages,
        batch_pages=args.batch_pages,
        limit_per_page=args.limit_per_page,
        min_sleep_s=args.min_sleep,
        max_sleep_s=args.max_sleep,
        timeout_s=args.timeout,
    )
    paths = run_batched(cfg, out_dir=Path(args.out_dir), out_prefix=args.out_prefix)
    print(f"Wrote {len(paths)} file(s).")
    for p in paths:
        print(p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

