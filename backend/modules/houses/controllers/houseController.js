"use strict";

const response = require("utils/responseUtils");
const ServiceError = require("utils/serviceError");
const houseService = require("../services/houseService");

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
  list: async (req, res) => {
    try {
      const result = await houseService.list(req.query);
      return response.ok(res, result);
    } catch (error) {
      return handleServiceError(res, error);
    }
  },

  detail: async (req, res) => {
    try {
      const id = req.params.id;
      console.log("id: ", id);
      const house = await houseService.detail(req.params.id);
      return response.ok(res, house);
    } catch (error) {
      return handleServiceError(res, error);
    }
  },
};

