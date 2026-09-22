const {
    getLatestRainfallReading,
    getRainfallHistory
} = require("../rainfall/rainfall.model");

const {
    getLatestSoilMoisture,
    getSoilMoistureHistory
} = require("../soilMoisture/soilMoisture.model");

const {
    getTerrain
} = require("../terrain/terrain.model");

const {
    getHistoricalRiskFeatures
} = require("../historicalLandslides/historicalLandslides.service");

const {
    getLatestSatelliteObservation
} = require("../satellite/satellite.model");


const getLocationMonitoringData = async (
    latitude,
    longitude
) => {

    const [
        rainfall,
        rainfallHistory,
        soilMoisture,
        soilMoistureHistory,
        terrain,
        historicalLandslides,
        satellite
    ] = await Promise.all([

        getLatestRainfallReading(
            latitude,
            longitude
        ),

        getRainfallHistory(
            latitude,
            longitude,
            25
        ),

        getLatestSoilMoisture(
            latitude,
            longitude
        ),

        getSoilMoistureHistory(
            latitude,
            longitude,
            125
        ),

        getTerrain(
            latitude,
            longitude
        ),

        getHistoricalRiskFeatures(
            latitude,
            longitude
        ),

        getLatestSatelliteObservation(
            latitude,
            longitude
        )
    ]);


    return {

        location: {
            latitude,
            longitude
        },

        rainfall: {
            latest: rainfall,
            history: rainfallHistory
        },

        soilMoisture: {
            latest: soilMoisture,
            history: soilMoistureHistory
        },

        terrain,

        historicalLandslides,

        satellite

    };
};


module.exports = {
    getLocationMonitoringData
};