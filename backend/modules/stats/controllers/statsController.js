"use strict";

const response = require("utils/responseUtils");
const ServiceError = require("utils/serviceError");
const statsService = require("../services/statsService");

const handleServiceError = (res, error) => {
  if (error instanceof ServiceError) {
    if (error.status === 404) return response.notFound(res);
    if (error.status === 422) return response.invalidated(res, error.data);
    return res.status(error.status).send({
      success: false,
      status: error.status,
      message: error.message,
      data: error.data || null,
    });
  }

  return response.error(res, error.message);
};

module.exports = {
  overview: async (req, res) => {
    try {
      const data = await statsService.overview();
      return response.ok(res, data);
    } catch (error) {
      return handleServiceError(res, error);
    }
  },

  priceDistribution: async (req, res) => {
    try {
      const data = await statsService.priceDistribution();
      return response.ok(res, data);
    } catch (error) {
      return handleServiceError(res, error);
    }
  },
};

