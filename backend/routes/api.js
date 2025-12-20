require("express-router-group");
const express = require("express");
const { validate } = require("kernels/validations");
const houseController = require("modules/houses/controllers/houseController");
const houseMapController = require("modules/houses/controllers/houseMapController");
const statsController = require("modules/stats/controllers/statsController");
const filtersController = require("modules/filters/controllers/filtersController");
const router = express.Router({ mergeParams: true });



router.group("/api/v1", validate([]), (router) => {
  router.get("/houses", houseController.list);
  router.get("/houses/map", houseMapController.map);
  router.get("/houses/:id", houseController.detail);

  router.get("/stats/overview", statsController.overview);
  router.get("/stats/price-distribution", statsController.priceDistribution);

  router.get("/filters/districts", filtersController.districts);
  router.get("/filters/wards", filtersController.wards);
});

module.exports = router;
