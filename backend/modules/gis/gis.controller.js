const gisService = require("./gis.service");

const getRiskLocations = async (req, res) => {
    try {
        const riskLevel = req.query.risk_level;

        const allowedLevels = [
            "low",
            "medium",
            "high",
            "critical"
        ];

        if (riskLevel && !allowedLevels.includes(riskLevel)) {
            return res.status(400).json({
                success: false,
                message: "Invalid risk level"
            });
        }

        const locations = await gisService.getRiskLocations(riskLevel);

        res.status(200).json({
            success: true,
            count: locations.length,
            data: locations
        });

    } catch (error) {
        console.error("GIS controller error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch risk locations"
        });
    }
};

const getRiskSummary = async (req, res) => {
    try {
        const summary = await gisService.getRiskSummary();

        res.status(200).json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error("Risk summary error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch risk summary"
        });
    }
};


const getRiskLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const location = await gisService.getRiskLocationById(id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Risk location not found"
            });
        }

        res.status(200).json({
            success: true,
            data: location
        });

    } catch (error) {
        console.error("Risk location details error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch risk location"
        });
    }
};

module.exports = {
    getRiskLocations,
    getRiskSummary,
    getRiskLocationById
};