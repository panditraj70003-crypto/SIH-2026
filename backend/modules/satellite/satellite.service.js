const {
    createSatelliteObservation,
    getLatestSatelliteObservation,
    getSatelliteHistory
} = require("./satellite.model");


const addSatelliteObservation = async (data) => {
    const {
        latitude,
        longitude,
        observationTime,
        provider,
        assetId,
        imageUrl,
        cloudCover,
        ndvi,
        rawData
    } = data;

    if (latitude === undefined || longitude === undefined) {
        throw new Error("Latitude and longitude are required");
    }

    if (!observationTime) {
        throw new Error("Observation time is required");
    }

    if (
        cloudCover !== null &&
        cloudCover !== undefined &&
        (Number(cloudCover) < 0 || Number(cloudCover) > 100)
    ) {
        throw new Error("Cloud cover must be between 0 and 100");
    }

    if (
        ndvi !== null &&
        ndvi !== undefined &&
        (Number(ndvi) < -1 || Number(ndvi) > 1)
    ) {
        throw new Error("NDVI must be between -1 and 1");
    }

    return await createSatelliteObservation({
        latitude,
        longitude,
        observationTime,
        provider,
        assetId,
        imageUrl,
        cloudCover,
        ndvi,
        rawData
    });
};


const getLatestSatellite = async (latitude, longitude) => {
    return await getLatestSatelliteObservation(
        latitude,
        longitude
    );
};


const getSatelliteObservations = async (
    latitude,
    longitude,
    limit = 10
) => {
    const parsedLimit = Math.min(
        Math.max(Number(limit) || 10, 1),
        100
    );

    return await getSatelliteHistory(
        latitude,
        longitude,
        parsedLimit
    );
};


module.exports = {
    addSatelliteObservation,
    getLatestSatellite,
    getSatelliteObservations
};