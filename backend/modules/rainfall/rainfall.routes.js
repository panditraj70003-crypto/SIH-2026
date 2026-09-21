const express = require("express");

const {
    createRainfall,
    getLatestRainfall,
    getRainfallHistory,
    getRainfallAccumulation,
    fetchRainfallData
} = require("./rainfall.controller");

const router = express.Router();


// Fetch real rainfall from Open-Meteo
router.post(
    "/fetch/:latitude/:longitude",
    fetchRainfallData
);


// Manually create rainfall reading
router.post(
    "/",
    createRainfall
);


// Rainfall history
router.get(
    "/:latitude/:longitude/history",
    getRainfallHistory
);


// Rainfall accumulation
router.get(
    "/:latitude/:longitude/accumulation",
    getRainfallAccumulation
);


// Latest rainfall
router.get(
    "/:latitude/:longitude",
    getLatestRainfall
);


module.exports = router;