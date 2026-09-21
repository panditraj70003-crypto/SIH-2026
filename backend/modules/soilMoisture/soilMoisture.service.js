const {
    createSoilMoistureReading,
    getLatestSoilMoisture,
    getSoilMoistureHistory
} = require("./soilMoisture.model");


const saveSoilMoistureReading = async ({
    latitude,
    longitude,
    soilMoisture,
    observationTime,
    depthCm,
    source = "DEMO",
    rawData = null
}) => {

    if (
        latitude === undefined ||
        longitude === undefined ||
        soilMoisture === undefined ||
        !observationTime
    ) {
        throw new Error(
            "Required soil moisture data is missing"
        );
    }


    if (
        Number(soilMoisture) < 0 ||
        Number(soilMoisture) > 1
    ) {
        throw new Error(
            "Soil moisture must be between 0 and 1"
        );
    }


    return await createSoilMoistureReading({
        latitude,
        longitude,
        soilMoisture,
        observationTime,
        depthCm,
        source,
        rawData
    });
};


const fetchLatestSoilMoisture = async (
    latitude,
    longitude
) => {

    return await getLatestSoilMoisture(
        latitude,
        longitude
    );
};


const fetchSoilMoistureHistory = async (
    latitude,
    longitude,
    limit = 24
) => {

    return await getSoilMoistureHistory(
        latitude,
        longitude,
        limit
    );
};


module.exports = {
    saveSoilMoistureReading,
    fetchLatestSoilMoisture,
    fetchSoilMoistureHistory
};