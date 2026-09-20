const express = require("express");

const {
    createRainfall,
    getLatestRainfall,
    getRainfallHistory,
    getRainfallAccumulationData
} = require("./rainfall.controller");

const router = express.Router();


router.post("/", createRainfall);


router.get(
    "/:latitude/:longitude/history",
    getRainfallHistory
);


router.get(
    "/:latitude/:longitude/accumulation",
    getRainfallAccumulationData
);


router.get(
    "/:latitude/:longitude",
    getLatestRainfall
);


module.exports = router;