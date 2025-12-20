"use strict";

require("rootpath")();

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const db = require("models");

const DEFAULT_CSV_PATH = path.resolve(__dirname, "../../data/complete_house_dataset.csv");

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toInteger = (value) => {
  const n = toNumber(value);
  return n === null ? null : Math.trunc(n);
};

const toBoolean = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return null;
};

const toDateOnly = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const mapHouseRow = (row) => {
  return {
    title: row.title || "",
    price: toNumber(row.price),
    area: toNumber(row.area),
    date: toNumber(row.date),
    city: row.city || null,
    district: row.district || null,
    ward: row.ward || null,
    street: row.street || null,
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    body: row.body || null,
    rooms: toInteger(row.rooms),
    toilets: toInteger(row.toilets),
    floors: toInteger(row.floors),
    legal: toInteger(row.legal),
    seller_type: toBoolean(row.seller_type),
    protection: toBoolean(row.protection),
    image_count: toInteger(row.image_count),
    image_thumb: row.image_thumb || null,
    width: toNumber(row.width),
    length: toNumber(row.length),
    pty_characteristics: row.pty_characteristics || null,
    owner_type: toBoolean(row.owner_type),
    is_pro: toBoolean(row.is_pro),
    verified: toBoolean(row.verified),
    page: toInteger(row.page),
    date_formatted: toDateOnly(row.dateFormatted),
  };
};

const parseArgs = (argv) => {
  const args = { csv: DEFAULT_CSV_PATH, batch: 1000, truncate: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--csv") args.csv = path.resolve(argv[i + 1]);
    if (a === "--batch") args.batch = Math.max(1, Number(argv[i + 1]) || 1000);
    if (a === "--truncate") args.truncate = true;
  }
  return args;
};

const main = async () => {
  const { csv, batch, truncate } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(csv)) {
    throw new Error(`CSV not found: ${csv}`);
  }

  await db.sequelize.authenticate();

  if (truncate) {
    await db.House.destroy({ where: {}, truncate: true });
  }

  const parser = fs.createReadStream(csv).pipe(
    parse({
      columns: true,
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  let buffer = [];
  let total = 0;

  for await (const row of parser) {
    const mapped = mapHouseRow(row);
    if (!mapped.title || mapped.price === null) continue;

    buffer.push(mapped);
    if (buffer.length >= batch) {
      await db.House.bulkCreate(buffer);
      total += buffer.length;
      buffer = [];
    }
  }

  if (buffer.length) {
    await db.House.bulkCreate(buffer);
    total += buffer.length;
  }

  // eslint-disable-next-line no-console
  console.log(`Imported ${total} houses into ${db.sequelize.getDialect()}`);
  await db.sequelize.close();
};

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    await db.sequelize.close();
  } catch (_) {}
  process.exit(1);
});
