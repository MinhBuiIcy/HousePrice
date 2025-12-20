"use strict";

const response = require("utils/responseUtils");
const ServiceError = require("utils/serviceError");
const houseMapService = require("../services/houseMapService");

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
  map: async (req, res) => {
    try {
      console.log("req.query: ", req.query);
      const markers = await houseMapService.markers(req.query);
      return response.ok(res, { markers });
    } catch (error) {
      return handleServiceError(res, error);
    }
  },
};

