const express = require("express");

const router = express.Router();

const gisController = require("./gis.controller");

// Get risk locations
router.get(
    "/risk-locations",
    gisController.getRiskLocations
);

router.get("/risk-summary", gisController.getRiskSummary);

module.exports = router;