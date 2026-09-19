const express = require("express");
const multer = require("multer");

const reportsController = require("./reports.controller");
const authenticate = require("../../middlewares/auth.middleware");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

router.post(
    "/",
    authenticate,
    upload.single("image"),
    reportsController.createReport
);

router.get(
    "/my-reports",
    authenticate,
    reportsController.getMyReports
);

module.exports = router;