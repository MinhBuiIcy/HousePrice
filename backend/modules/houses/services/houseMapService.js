"use strict";

const { Op } = require("sequelize");
const db = require("models");

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const priceCategory = (price) => {
  if (price === null || price === undefined) return "unknown";
  if (price < 5_000_000_000) return "low";
  if (price < 10_000_000_000) return "medium";
  if (price < 20_000_000_000) return "high";
  return "very_high";
};

module.exports = {
  markers: async (query) => {
    const where = {};

    const minPrice = parseNumber(query.min_price);
    const maxPrice = parseNumber(query.max_price);
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }

    if (query.district) where.district = query.district;
    console.log(where);

    const north = parseNumber(query.north);
    const south = parseNumber(query.south);
    const east = parseNumber(query.east);
    const west = parseNumber(query.west);
    if (
      north !== undefined &&
      south !== undefined &&
      east !== undefined &&
      west !== undefined
    ) {
      where.lat = { [Op.between]: [south, north] };
      where.lng = { [Op.between]: [west, east] };
    }

    const houses = await db.House.findAll({
      where,
      limit: 5000,
    });

    return houses
      .filter((h) => h.lat !== null && h.lng !== null)
      .map((h) => ({
        id: h.id,
        lat: h.lat,
        lng: h.lng,
        price: h.price,
        title: h.title,
        area: h.area,
        image_thumb: h.image_thumb,
        price_category: priceCategory(h.price),
        rooms: h.rooms,
        toilets: h.toilets,
        floors: h.floors,
        length: h.length,
        width: h.width,
        legal: h.legal,
        ward: h.ward,
        district: h.district,
        city: h.city
      }));
  },
};

