const {
    createRainfallReading,
    getLatestRainfallReading,
    getRainfallHistory,
    getRainfallAccumulation,
} = require("./rainfall.model");


const saveRainfallReading = async ({
    latitude,
    longitude,
    rainfallMm,
    observationTime,
    district,
    state,
    source = "DEMO",
    rawData = null
}) => {

    if (
        latitude === undefined ||
        longitude === undefined ||
        rainfallMm === undefined ||
        !observationTime
    ) {
        throw new Error("Required rainfall data is missing");
    }

    const reading = await createRainfallReading({
        latitude,
        longitude,
        rainfallMm,
        observationTime,
        district,
        state,
        source,
        rawData
    });

    return reading;
};


const fetchLatestRainfall = async (latitude, longitude) => {

    const reading = await getLatestRainfallReading(
        latitude,
        longitude
    );

    return reading;
};


const fetchRainfallHistory = async (
    latitude,
    longitude,
    limit = 24
) => {

    const readings = await getRainfallHistory(
        latitude,
        longitude,
        limit
    );

    return readings;
};

const fetchRainfallAccumulation = async (
    latitude,
    longitude
) => {

    const rainfall = await getRainfallAccumulation(
        latitude,
        longitude
    );

    return rainfall;
};


module.exports = {
    saveRainfallReading,
    fetchLatestRainfall,
    fetchRainfallHistory,
    fetchRainfallAccumulation,
};