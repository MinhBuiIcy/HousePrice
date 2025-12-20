"use strict";

module.exports = (sequelize, DataTypes) => {
  const Prediction = sequelize.define(
    "Prediction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      area: { type: DataTypes.DOUBLE, allowNull: false },
      rooms: { type: DataTypes.INTEGER, allowNull: true },
      toilets: { type: DataTypes.INTEGER, allowNull: true },
      floors: { type: DataTypes.INTEGER, allowNull: true },
      district: { type: DataTypes.TEXT, allowNull: true },
      ward: { type: DataTypes.TEXT, allowNull: true },
      lat: { type: DataTypes.DOUBLE, allowNull: true },
      lng: { type: DataTypes.DOUBLE, allowNull: true },
      width: { type: DataTypes.DOUBLE, allowNull: true },
      length: { type: DataTypes.DOUBLE, allowNull: true },
      predicted_price: { type: DataTypes.DOUBLE, allowNull: false },
      confidence_lower: { type: DataTypes.DOUBLE, allowNull: true },
      confidence_upper: { type: DataTypes.DOUBLE, allowNull: true },
    },
    {
      tableName: "predictions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return Prediction;
};

