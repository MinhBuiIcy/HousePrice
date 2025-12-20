"use strict";

const response = require("utils/responseUtils");
const ServiceError = require("utils/serviceError");
const filtersService = require("../services/filtersService");

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
  districts: async (req, res) => {
    try {
      const districts = await filtersService.districts();
      return response.ok(res, { districts });
    } catch (error) {
      return handleServiceError(res, error);
    }
  },

  wards: async (req, res) => {
    try {
      const wards = await filtersService.wards(req.query.district);
      return response.ok(res, { wards });
    } catch (error) {
      return handleServiceError(res, error);
    }
  },
};

