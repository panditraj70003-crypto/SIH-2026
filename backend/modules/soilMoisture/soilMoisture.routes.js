const express = require("express");

const {
    createSoilMoisture,
    getLatest,
    getHistory
} = require("./soilMoisture.controller");


const router = express.Router();


router.post(
    "/",
    createSoilMoisture
);


router.get(
    "/:latitude/:longitude/history",
    getHistory
);


router.get(
    "/:latitude/:longitude",
    getLatest
);


module.exports = router;