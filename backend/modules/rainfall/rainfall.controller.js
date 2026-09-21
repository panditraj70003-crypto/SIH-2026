const {
    addRainfallReading,
    fetchAndStoreRainfall,
    getRainfall,
    getRainfallHistoryData,
    getRainfallAccumulationData
} = require("./rainfall.service");


const createRainfall = async (req, res) => {

    try {

        const reading =
            await addRainfallReading(req.body);

        res.status(201).json({
            success: true,
            message:
                "Rainfall reading created successfully",
            data: reading
        });

    } catch (error) {

        console.error(
            "Create rainfall error:",
            error
        );

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getLatestRainfall = async (req, res) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;

        const reading =
            await getRainfall(
                Number(latitude),
                Number(longitude)
            );

        if (!reading) {

            return res.status(404).json({
                success: false,
                message:
                    "No rainfall data found for this location"
            });
        }

        res.status(200).json({
            success: true,
            data: reading
        });

    } catch (error) {

        console.error(
            "Get latest rainfall error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getRainfallHistory = async (req, res) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;

        const limit =
            Number(req.query.limit) || 24;

        const readings =
            await getRainfallHistoryData(
                Number(latitude),
                Number(longitude),
                limit
            );

        res.status(200).json({
            success: true,
            count: readings.length,
            data: readings
        });

    } catch (error) {

        console.error(
            "Get rainfall history error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getRainfallAccumulation = async (
    req,
    res
) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;

        const rainfall =
            await getRainfallAccumulationData(
                Number(latitude),
                Number(longitude)
            );

        res.status(200).json({
            success: true,
            data: rainfall
        });

    } catch (error) {

        console.error(
            "Get rainfall accumulation error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const fetchRainfallData = async (
    req,
    res
) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;

        const {
            district = null,
            state = null,
            pastHours = 24
        } = req.query;

        const result =
            await fetchAndStoreRainfall({

                latitude:
                    Number(latitude),

                longitude:
                    Number(longitude),

                district,
                state,

                pastHours:
                    Number(pastHours)
            });

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "Fetch rainfall error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createRainfall,
    getLatestRainfall,
    getRainfallHistory,
    getRainfallAccumulation,
    fetchRainfallData
};