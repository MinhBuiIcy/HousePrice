"use strict";

const { Op } = require("sequelize");
const db = require("models");
const ServiceError = require("utils/serviceError");

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const parseInteger = (value) => {
  const numberValue = parseNumber(value);
  if (numberValue === undefined) return undefined;
  return Math.trunc(numberValue);
};

const pickSort = ({ sort_by, sort_order }) => {
  const sortBy = ["price", "area", "date"].includes(sort_by) ? sort_by : "date";
  const sortOrder = sort_order === "asc" ? "ASC" : "DESC";
  return [sortBy, sortOrder];
};

module.exports = {
  list: async (query) => {
    const page = Math.max(1, parseInteger(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInteger(query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = {};

    const minPrice = parseNumber(query.min_price);
    const maxPrice = parseNumber(query.max_price);
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }

    const minArea = parseNumber(query.min_area);
    const maxArea = parseNumber(query.max_area);
    if (minArea !== undefined || maxArea !== undefined) {
      where.area = {};
      if (minArea !== undefined) where.area[Op.gte] = minArea;
      if (maxArea !== undefined) where.area[Op.lte] = maxArea;
    }

    if (query.city) where.city = query.city;
    if (query.district) where.district = query.district;
    if (query.ward) where.ward = query.ward;

    const minRooms = parseInteger(query.min_rooms);
    const maxRooms = parseInteger(query.max_rooms);
    if (minRooms !== undefined || maxRooms !== undefined) {
      where.rooms = {};
      if (minRooms !== undefined) where.rooms[Op.gte] = minRooms;
      if (maxRooms !== undefined) where.rooms[Op.lte] = maxRooms;
    }

    const [sortBy, sortOrder] = pickSort(query);

    const { count, rows } = await db.House.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    };
  },

  detail: async (idParam) => {
    const id = parseInteger(idParam);
    console.log("Parsed id: ", id);
    if (!id) throw new ServiceError("Not found", { status: 404 });

    const house = await db.House.findByPk(id);
    console.log("Fetched house: ", house);
    if (!house) throw new ServiceError("Not found", { status: 404 });

    return house;
  },
};

