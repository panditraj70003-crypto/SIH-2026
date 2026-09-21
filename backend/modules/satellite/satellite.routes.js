const express = require("express");

const {
    createSatelliteObservation,
    getLatestSatelliteObservation,
    getSatelliteHistoryData
} = require("./satellite.controller");

const router = express.Router();


// Add satellite observation
router.post(
    "/",
    createSatelliteObservation
);


// Get latest observation
router.get(
    "/:latitude/:longitude",
    getLatestSatelliteObservation
);


// Get observation history
router.get(
    "/:latitude/:longitude/history",
    getSatelliteHistoryData
);


module.exports = router;