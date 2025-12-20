"use strict";

const db = require("models");
const { fn, col, where: whereFn } = require("sequelize");
const ServiceError = require("utils/serviceError");

module.exports = {
  districts: async () => {
    const rows = await db.House.findAll({
      attributes: [[fn("DISTINCT", col("district")), "district"]],
      where: whereFn(col("district"), "!=", null),
      order: [["district", "ASC"]],
      raw: true,
    });
    return rows.map((r) => r.district).filter(Boolean);
  },

  wards: async (district) => {
    if (!district) {
      throw new ServiceError("Invalid request", {
        status: 422,
        data: { errors: [{ field: "district", message: "Required" }] },
      });
    }
    const rows = await db.House.findAll({
      attributes: [[fn("DISTINCT", col("ward")), "ward"]],
      where: { district },
      order: [["ward", "ASC"]],
      raw: true,
    });

    return rows.map((r) => r.ward).filter(Boolean);
  },
};

