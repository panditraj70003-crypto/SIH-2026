const express = require("express");

const {
    getMonitoringData
} = require("./monitoring.controller");


const router = express.Router();


router.get(
    "/:latitude/:longitude",
    getMonitoringData
);


module.exports = router;