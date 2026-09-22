const express = require("express");

const router = express.Router();

const gisController = require("./gis.controller");

// Get risk locations
router.get(
    "/risk-locations",
    gisController.getRiskLocations
);

router.get("/risk-summary", gisController.getRiskSummary);
router.get("/risk-locations/:id", gisController.getRiskLocationById);

module.exports = router;