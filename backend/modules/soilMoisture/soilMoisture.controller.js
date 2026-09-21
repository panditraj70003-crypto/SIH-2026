const {
    fetchAndStoreSoilMoisture
} = require("./soilMoisture.service");

const {
    getLatestSoilMoisture,
    getSoilMoistureHistory
} = require("./soilMoisture.model");


const fetchSoilMoistureData = async (
    req,
    res
) => {
    try {

        const {
            latitude,
            longitude
        } = req.params;

        const {
            pastHours = 24
        } = req.query;

        const result =
            await fetchAndStoreSoilMoisture({
                latitude: Number(latitude),
                longitude: Number(longitude),
                pastHours: Number(pastHours)
            });

        res.status(200).json({
            success: true,
            message:
                "Soil moisture data fetched and stored successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Fetch soil moisture error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getLatestSoilMoistureData = async (
    req,
    res
) => {
    try {

        const {
            latitude,
            longitude
        } = req.params;

        const result =
            await getLatestSoilMoisture(
                Number(latitude),
                Number(longitude)
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "No soil moisture data found for this location"
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "Get latest soil moisture error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getSoilMoistureHistoryData = async (
    req,
    res
) => {
    try {

        const {
            latitude,
            longitude
        } = req.params;

        const limit =
            Number(req.query.limit) || 100;

        const result =
            await getSoilMoistureHistory(
                Number(latitude),
                Number(longitude),
                limit
            );

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {

        console.error(
            "Get soil moisture history error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    fetchSoilMoistureData,
    getLatestSoilMoistureData,
    getSoilMoistureHistoryData
};