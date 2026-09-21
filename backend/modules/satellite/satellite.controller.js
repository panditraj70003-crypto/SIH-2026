const {
    addSatelliteObservation,
    getLatestSatellite,
    getSatelliteObservations
} = require("./satellite.service");


const createSatelliteObservation = async (req, res) => {
    try {
        const observation =
            await addSatelliteObservation(req.body);

        res.status(201).json({
            success: true,
            data: observation
        });

    } catch (error) {
        console.error("Satellite observation error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getLatestSatelliteObservation = async (req, res) => {
    try {
        const {
            latitude,
            longitude
        } = req.params;

        const observation =
            await getLatestSatellite(
                Number(latitude),
                Number(longitude)
            );

        if (!observation) {
            return res.status(404).json({
                success: false,
                message: "No satellite observation found"
            });
        }

        res.status(200).json({
            success: true,
            data: observation
        });

    } catch (error) {
        console.error("Get satellite observation error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getSatelliteHistoryData = async (req, res) => {
    try {
        const {
            latitude,
            longitude
        } = req.params;

        const { limit } = req.query;

        const observations =
            await getSatelliteObservations(
                Number(latitude),
                Number(longitude),
                limit
            );

        res.status(200).json({
            success: true,
            data: observations
        });

    } catch (error) {
        console.error("Satellite history error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createSatelliteObservation,
    getLatestSatelliteObservation,
    getSatelliteHistoryData
};