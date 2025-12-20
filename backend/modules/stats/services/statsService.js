"use strict";

const db = require("models");
const { fn, col } = require("sequelize");

const medianFromSorted = (sortedNumbers) => {
  const n = sortedNumbers.length;
  if (n === 0) return null;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sortedNumbers[mid];
  return (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
};

const histogramRange = (price) => {
  if (price === null || price === undefined) return null;
  const billion = 1_000_000_000;
  const p = price / billion;
  if (p < 2) return "0-2 tỉ";
  if (p < 5) return "2-5 tỉ";
  if (p < 10) return "5-10 tỉ";
  if (p < 20) return "10-20 tỉ";
  return "20-50 tỉ";
};

module.exports = {
  overview: async () => {
    const totalHouses = await db.House.count();

    const avgPriceRow = await db.House.findOne({
      attributes: [[fn("AVG", col("price")), "avg_price"]],
      raw: true,
    });
    const avgAreaRow = await db.House.findOne({
      attributes: [[fn("AVG", col("area")), "avg_area"]],
      raw: true,
    });
    const minMaxRow = await db.House.findOne({
      attributes: [
        [fn("MIN", col("price")), "min_price"],
        [fn("MAX", col("price")), "max_price"],
      ],
      raw: true,
    });

    const prices = await db.House.findAll({
      attributes: ["price"],
      order: [["price", "ASC"]],
      raw: true,
    });
    const priceValues = prices.map((p) => p.price).filter((p) => typeof p === "number");
    const medianPrice = medianFromSorted(priceValues);

    const mostExpensiveDistrict = await db.House.findOne({
      attributes: ["district", [fn("AVG", col("price")), "avg_price"]],
      group: ["district"],
      order: [[fn("AVG", col("price")), "DESC"]],
      raw: true,
    });

    const mostAffordableDistrict = await db.House.findOne({
      attributes: ["district", [fn("AVG", col("price")), "avg_price"]],
      group: ["district"],
      order: [[fn("AVG", col("price")), "ASC"]],
      raw: true,
    });

    const totalValueRow = await db.House.findOne({
      attributes: [[fn("SUM", col("price")), "total_value"]],
      raw: true,
    });

    return {
      total_houses: totalHouses,
      average_price: avgPriceRow?.avg_price ? Number(avgPriceRow.avg_price) : null,
      median_price: medianPrice,
      average_area: avgAreaRow?.avg_area ? Number(avgAreaRow.avg_area) : null,
      price_range: {
        min: minMaxRow?.min_price ? Number(minMaxRow.min_price) : null,
        max: minMaxRow?.max_price ? Number(minMaxRow.max_price) : null,
      },
      most_expensive_district: mostExpensiveDistrict?.district || null,
      most_affordable_district: mostAffordableDistrict?.district || null,
      total_value: totalValueRow?.total_value ? Number(totalValueRow.total_value) : null,
    };
  },

  priceDistribution: async () => {
    const houses = await db.House.findAll({
      attributes: ["price", "district"],
      raw: true,
    });

    const histogramBuckets = new Map();
    const districtAgg = new Map();

    for (const h of houses) {
      const range = histogramRange(h.price);
      if (range) histogramBuckets.set(range, (histogramBuckets.get(range) || 0) + 1);

      if (h.district) {
        const cur = districtAgg.get(h.district) || { sum: 0, prices: [], count: 0 };
        cur.sum += typeof h.price === "number" ? h.price : 0;
        if (typeof h.price === "number") cur.prices.push(h.price);
        cur.count += 1;
        districtAgg.set(h.district, cur);
      }
    }

    const total = houses.length || 1;
    const histogramOrder = ["0-2 tỉ", "2-5 tỉ", "5-10 tỉ", "10-20 tỉ", "20-50 tỉ"];
    const histogram = histogramOrder
      .filter((r) => histogramBuckets.has(r))
      .map((r) => {
        const count = histogramBuckets.get(r);
        return { range: r, count, percentage: (count / total) * 100 };
      });

    const byDistrict = Array.from(districtAgg.entries()).map(([district, agg]) => {
      agg.prices.sort((a, b) => a - b);
      return {
        district,
        average_price: agg.count ? agg.sum / agg.count : null,
        median_price: medianFromSorted(agg.prices),
        count: agg.count,
      };
    });

    byDistrict.sort((a, b) => (b.count || 0) - (a.count || 0));

    return { histogram, by_district: byDistrict };
  },
};

