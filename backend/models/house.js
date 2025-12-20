"use strict";

module.exports = (sequelize, DataTypes) => {
  const House = sequelize.define(
    "House",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      title: { type: DataTypes.TEXT, allowNull: false },
      price: { type: DataTypes.DOUBLE, allowNull: false },
      area: { type: DataTypes.DOUBLE, allowNull: true },
      date: { type: DataTypes.BIGINT, allowNull: true },
      city: { type: DataTypes.TEXT, allowNull: true },
      district: { type: DataTypes.TEXT, allowNull: true },
      ward: { type: DataTypes.TEXT, allowNull: true },
      street: { type: DataTypes.TEXT, allowNull: true },
      lat: { type: DataTypes.DOUBLE, allowNull: true },
      lng: { type: DataTypes.DOUBLE, allowNull: true },
      body: { type: DataTypes.TEXT, allowNull: true },
      rooms: { type: DataTypes.INTEGER, allowNull: true },
      toilets: { type: DataTypes.INTEGER, allowNull: true },
      floors: { type: DataTypes.INTEGER, allowNull: true },
      legal: { type: DataTypes.INTEGER, allowNull: true },
      seller_type: { type: DataTypes.BOOLEAN, allowNull: true },
      protection: { type: DataTypes.BOOLEAN, allowNull: true },
      image_count: { type: DataTypes.INTEGER, allowNull: true },
      image_thumb: { type: DataTypes.TEXT, allowNull: true },
      width: { type: DataTypes.DOUBLE, allowNull: true },
      length: { type: DataTypes.DOUBLE, allowNull: true },
      pty_characteristics: { type: DataTypes.TEXT, allowNull: true },
      owner_type: { type: DataTypes.BOOLEAN, allowNull: true },
      is_pro: { type: DataTypes.BOOLEAN, allowNull: true },
      verified: { type: DataTypes.BOOLEAN, allowNull: true },
      page: { type: DataTypes.INTEGER, allowNull: true },
      date_formatted: { type: DataTypes.DATEONLY, allowNull: true },
    },
    {
      tableName: "houses",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return House;
};

