"use strict";

const response = require("utils/responseUtils");
const predictor = require("../../../ml/predictor");

const handleMLError = (res, error) => {
  console.error("ML Error:", error.message);
  return response.error(res, error.message);
};

module.exports = {
  /**
   * Health check
   * GET /api/v1/ml/health
   */
  health: async (req, res) => {
    try {
      const status = predictor.getStatus();
      return response.ok(res, status);
    } catch (error) {
      return handleMLError(res, error);
    }
  },

  /**
   * Predict house price
   * POST /api/v1/ml/predict
   * Body: { area, rooms, toilets, floors, width, length, lat, lng, district, ward, legal, seller_type }
   */
  predict: async (req, res) => {
    try {
      // Validate required field
      if (!req.body.area) {
        return res.status(400).send({
          success: false,
          message: "Area is required"
        });
      }

      const result = await predictor.predictPrice(req.body);
      return response.ok(res, result);
    } catch (error) {
      return handleMLError(res, error);
    }
  },

  /**
   * Recommend houses by house ID
   * GET /api/v1/ml/recommend/:houseId
   * Query: limit (default: 5)
   */
  recommendById: async (req, res) => {
    try {
      const houseId = parseInt(req.params.houseId, 10);
      const limit = parseInt(req.query.limit || '5', 10);

      if (isNaN(houseId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid house ID"
        });
      }

      const result = await predictor.recommendByHouseId(houseId, limit);
      return response.ok(res, result);
    } catch (error) {
      return handleMLError(res, error);
    }
  },

  /**
   * Recommend houses by features
   * POST /api/v1/ml/recommend
   * Body: { price, area, rooms, toilets, floors, district, lat, lng, n_recommendations }
   */
  recommendByFeatures: async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.price || !req.body.area) {
        return res.status(400).send({
          success: false,
          message: "Price and area are required"
        });
      }

      const result = await predictor.recommendByFeatures(req.body);
      return response.ok(res, result);
    } catch (error) {
      return handleMLError(res, error);
    }
  }
};
