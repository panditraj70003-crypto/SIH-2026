const express = require("express");

const {
    getEnvironmentalFeatures
} = require("./featureBuilder.controller");

const router = express.Router();

router.get(
    "/:latitude/:longitude",
    getEnvironmentalFeatures
);

module.exports = router;