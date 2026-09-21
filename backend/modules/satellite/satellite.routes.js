const express = require("express");

const {
    createSatelliteObservation,
    getLatestSatelliteObservation,
    getSatelliteHistoryData,
    searchSatellite,
    fetchLatestSatellite
} = require("./satellite.controller");

const router = express.Router();


// Search real Sentinel-2 data
router.get(
    "/search/:latitude/:longitude",
    searchSatellite
);


// Fetch + store latest Sentinel-2 observation
router.post(
    "/fetch/:latitude/:longitude",
    fetchLatestSatellite
);


// Store observation manually
router.post(
    "/",
    createSatelliteObservation
);


// Get latest stored observation
router.get(
    "/:latitude/:longitude",
    getLatestSatelliteObservation
);


// Get stored history
router.get(
    "/:latitude/:longitude/history",
    getSatelliteHistoryData
);


module.exports = router;