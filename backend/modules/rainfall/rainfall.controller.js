const {
    saveRainfallReading,
    fetchLatestRainfall,
    fetchRainfallHistory,
    fetchRainfallAccumulation,
} = require("./rainfall.service");


const createRainfall = async (req, res) => {

    const {
        latitude,
        longitude,
        rainfallMm,
        observationTime,
        district,
        state,
        source,
        rawData
    } = req.body;


    const reading = await saveRainfallReading({
        latitude,
        longitude,
        rainfallMm,
        observationTime,
        district,
        state,
        source,
        rawData
    });


    res.status(201).json({
        success: true,
        message: "Rainfall reading created successfully",
        data: reading
    });
};


const getLatestRainfall = async (req, res) => {

    const { latitude, longitude } = req.params;

    const reading = await fetchLatestRainfall(
        Number(latitude),
        Number(longitude)
    );


    if (!reading) {
        return res.status(404).json({
            success: false,
            message: "No rainfall data found for this location"
        });
    }


    res.status(200).json({
        success: true,
        data: reading
    });
};


const getRainfallHistory = async (req, res) => {

    const { latitude, longitude } = req.params;

    const limit = Number(req.query.limit) || 24;


    const readings = await fetchRainfallHistory(
        Number(latitude),
        Number(longitude),
        limit
    );


    res.status(200).json({
        success: true,
        count: readings.length,
        data: readings
    });
};

const getRainfallAccumulationData = async (req, res) => {

    const {
        latitude,
        longitude
    } = req.params;


    const rainfall = await fetchRainfallAccumulation(
        Number(latitude),
        Number(longitude)
    );


    res.status(200).json({
        success: true,
        data: rainfall
    });
};


module.exports = {
    createRainfall,
    getLatestRainfall,
    getRainfallHistory,
    getRainfallAccumulationData,
};