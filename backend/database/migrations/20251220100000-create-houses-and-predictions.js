"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("houses", {
      id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.TEXT, allowNull: false },
      price: { type: Sequelize.DOUBLE, allowNull: false },
      area: { type: Sequelize.DOUBLE, allowNull: true },
      date: { type: Sequelize.BIGINT, allowNull: true },
      city: { type: Sequelize.TEXT, allowNull: true },
      district: { type: Sequelize.TEXT, allowNull: true },
      ward: { type: Sequelize.TEXT, allowNull: true },
      street: { type: Sequelize.TEXT, allowNull: true },
      lat: { type: Sequelize.DOUBLE, allowNull: true },
      lng: { type: Sequelize.DOUBLE, allowNull: true },
      body: { type: Sequelize.TEXT, allowNull: true },
      rooms: { type: Sequelize.INTEGER, allowNull: true },
      toilets: { type: Sequelize.INTEGER, allowNull: true },
      floors: { type: Sequelize.INTEGER, allowNull: true },
      legal: { type: Sequelize.INTEGER, allowNull: true },
      seller_type: { type: Sequelize.BOOLEAN, allowNull: true },
      protection: { type: Sequelize.BOOLEAN, allowNull: true },
      image_count: { type: Sequelize.INTEGER, allowNull: true },
      image_thumb: { type: Sequelize.TEXT, allowNull: true },
      width: { type: Sequelize.DOUBLE, allowNull: true },
      length: { type: Sequelize.DOUBLE, allowNull: true },
      pty_characteristics: { type: Sequelize.TEXT, allowNull: true },
      owner_type: { type: Sequelize.BOOLEAN, allowNull: true },
      is_pro: { type: Sequelize.BOOLEAN, allowNull: true },
      verified: { type: Sequelize.BOOLEAN, allowNull: true },
      page: { type: Sequelize.INTEGER, allowNull: true },
      date_formatted: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("houses", ["price"], { name: "idx_price" });
    await queryInterface.addIndex("houses", ["area"], { name: "idx_area" });
    await queryInterface.addIndex("houses", ["city", "district", "ward"], {
      name: "idx_location",
    });
    await queryInterface.addIndex("houses", ["lat", "lng"], {
      name: "idx_coordinates",
    });
    await queryInterface.addIndex("houses", ["date"], { name: "idx_date" });

    await queryInterface.createTable("predictions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      area: { type: Sequelize.DOUBLE, allowNull: false },
      rooms: { type: Sequelize.INTEGER, allowNull: true },
      toilets: { type: Sequelize.INTEGER, allowNull: true },
      floors: { type: Sequelize.INTEGER, allowNull: true },
      district: { type: Sequelize.TEXT, allowNull: true },
      ward: { type: Sequelize.TEXT, allowNull: true },
      lat: { type: Sequelize.DOUBLE, allowNull: true },
      lng: { type: Sequelize.DOUBLE, allowNull: true },
      width: { type: Sequelize.DOUBLE, allowNull: true },
      length: { type: Sequelize.DOUBLE, allowNull: true },
      predicted_price: { type: Sequelize.DOUBLE, allowNull: false },
      confidence_lower: { type: Sequelize.DOUBLE, allowNull: true },
      confidence_upper: { type: Sequelize.DOUBLE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("predictions");
    await queryInterface.dropTable("houses");
  },
};

