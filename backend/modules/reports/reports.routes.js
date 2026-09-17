
const express = require("express");

const reportsController = require("./reports.controller");
const authenticate = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    reportsController.createReport
);

router.get(
    "/my-reports",
    authenticate,
    reportsController.getMyReports
);

module.exports = router;