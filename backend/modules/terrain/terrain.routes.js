const express = require("express");

const {
    getTerrain,
    getStoredTerrain
} = require("./terrain.controller");


const router = express.Router();


router.get(
    "/:latitude/:longitude",
    getTerrain
);


router.get(
    "/:latitude/:longitude/stored",
    getStoredTerrain
);


module.exports = router;