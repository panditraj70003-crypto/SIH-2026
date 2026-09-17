const express = require("express");

const authController = require("./auth.controller");

const {
    validateRegisterInput
} = require("./auth.validation");

const router = express.Router();

router.post(
    "/register",
    validateRegisterInput,
    authController.register
);

router.post(
    "/login",
    authController.login
);

module.exports = router;