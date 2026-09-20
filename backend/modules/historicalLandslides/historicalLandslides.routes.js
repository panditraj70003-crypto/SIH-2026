const express = require("express");

const {
    createLandslide,
    getNearbyLandslides,
    getRiskFeatures
} = require(
    "./historicalLandslides.controller"
);


const router = express.Router();


router.post(
    "/",
    createLandslide
);


router.get(
    "/nearby/:latitude/:longitude",
    getNearbyLandslides
);


router.get(
    "/features/:latitude/:longitude",
    getRiskFeatures
);


module.exports = router;