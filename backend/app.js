const express = require("express");
const cors = require("cors");
const authenticate = require("./middlewares/auth.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const reportsRoutes = require("./modules/reports/reports.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "LandSafe API is running"
    });
});

app.get("/api/auth/profile", authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Profile accessed successfully",
        user: req.user
    });
});


const {
    verifyReportWithAI
} = require("./services/ai.service");

app.get("/api/test-ai", async (req, res) => {
    try {
        const result = await verifyReportWithAI(
            "Large cracks found on the hillside"
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


const multer = require("multer");

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

app.post(
    "/api/test-ai-image",
    upload.single("image"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Image is required"
                });
            }

            const description = req.body.description;

            if (!description) {
                return res.status(400).json({
                    success: false,
                    message: "Description is required"
                });
            }

            const result = await verifyReportWithAI(
                req.file.path,
                description
            );

            res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error("AI image test error:", error);

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

app.use("/api/reports", reportsRoutes);

app.use("/api/auth", authRoutes);

module.exports = app;