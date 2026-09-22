const {
    createRainfallReading,
    getRainfallHistory,
    getLatestRainfall,
    getRainfallAccumulation
} = require("./rainfall.model");

const {
    fetchRainfall
} = require("./rainfall.client");


// Existing manual insert
const addRainfallReading = async (data) => {

    const {
        latitude,
        longitude,
        rainfallMm,
        observationTime,
        source,
        district,
        state,
        rawData
    } = data;

    if (
        latitude === undefined ||
        longitude === undefined ||
        rainfallMm === undefined ||
        !observationTime
    ) {
        throw new Error(
            "Latitude, longitude, rainfallMm and observationTime are required"
        );
    }

    if (rainfallMm < 0) {
        throw new Error(
            "Rainfall cannot be negative"
        );
    }

    return await createRainfallReading({
        latitude,
        longitude,
        rainfallMm,
        observationTime,
        source: source || "DEMO",
        district: district || null,
        state: state || null,
        rawData: rawData || null
    });
};


// Fetch real rainfall from Open-Meteo
// and store it in PostgreSQL
const fetchAndStoreRainfall = async ({
    latitude,
    longitude,
    district = null,
    state = null,
    pastHours = 24
}) => {

    const result = await fetchRainfall({
        latitude,
        longitude,
        pastHours
    });

    const observations = [];

    for (const rainfall of result.rainfall) {

        const observation =
            await createRainfallReading({

                // Keep the original LandSafe coordinates
                latitude,
                longitude,

                rainfallMm:
                    rainfall.rainfallMm,

                observationTime:
                    new Date(
                        `${rainfall.observationTime}:00Z`
                    ),

                source:
                    "OPEN_METEO",

                district,
                state,

                rawData: {
                    provider:
                        "OPEN_METEO",

                    gridLatitude:
                        result.latitude,

                    gridLongitude:
                        result.longitude,

                    elevation:
                        result.elevation,

                    observationTime:
                        rainfall.observationTime,

                    precipitation:
                        rainfall.rainfallMm
                }
            });

        observations.push(observation);
    }

    return {
        latitude,
        longitude,
        source: "OPEN_METEO",
        count: observations.length,
        observations
    };
};


const getRainfall = async (
    latitude,
    longitude
) => {

    return await getLatestRainfall(
        latitude,
        longitude
    );
};


const getRainfallHistoryData = async (
    latitude,
    longitude,
    limit = 10
) => {

    return await getRainfallHistory(
        latitude,
        longitude,
        limit
    );
};


const getRainfallAccumulationData = async (
    latitude,
    longitude
) => {

    return await getRainfallAccumulation(
        latitude,
        longitude
    );
};


module.exports = {
    addRainfallReading,
    fetchAndStoreRainfall,
    getRainfall,
    getRainfallHistoryData,
    getRainfallAccumulationData
};