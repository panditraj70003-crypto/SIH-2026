const express = require("express");
const cors = require("cors");
const authenticate = require("./middlewares/auth.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const reportsRoutes = require("./modules/reports/reports.routes");

const rainfallRoutes = require("./modules/rainfall/rainfall.routes");
const terrainRoutes = require("./modules/terrain/terrain.routes");
const historicalLandslideRoutes = require("./modules/historicalLandslides/historicalLandslides.routes");
const soilMoistureRoutes = require("./modules/soilMoisture/soilMoisture.routes");
const satelliteRoutes = require("./modules/satellite/satellite.routes");
const monitoringRoutes =
    require("./modules/monitoring/monitoring.routes");

    const featureBuilderRoutes =
    require("./modules/featureBuilder/featureBuilder.routes");
const gisRoutes = require("./modules/gis/gis.routes");

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
app.use("/api/rainfall", rainfallRoutes);
app.use("/api/terrain",terrainRoutes);
app.use("/api/historical-landslides",historicalLandslideRoutes);
app.use("/api/soil-moisture",soilMoistureRoutes);
app.use("/api/satellite",satelliteRoutes);
app.use(
    "/api/monitoring",
    monitoringRoutes);
app.use(
    "/api/features",
    featureBuilderRoutes
);
app.use("/api/gis", gisRoutes);

module.exports = app;