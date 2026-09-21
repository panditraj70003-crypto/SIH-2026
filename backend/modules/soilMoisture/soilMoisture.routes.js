const express = require("express");

const {
    fetchSoilMoistureData,
    getLatestSoilMoistureData,
    getSoilMoistureHistoryData
} = require("./soilMoisture.controller");

const router = express.Router();


// Fetch from Open-Meteo and store in database
router.post(
    "/fetch/:latitude/:longitude",
    fetchSoilMoistureData
);


// Get stored history
router.get(
    "/:latitude/:longitude/history",
    getSoilMoistureHistoryData
);


// Get latest stored reading
router.get(
    "/:latitude/:longitude",
    getLatestSoilMoistureData
);


module.exports = router;