const {
    getLocationMonitoringData
} = require("../monitoring/monitoring.service");


const buildEnvironmentalFeatures = async (
    latitude,
    longitude
) => {

    /*
     * Get all environmental monitoring data
     */
    const monitoringData =
        await getLocationMonitoringData(
            latitude,
            longitude
        );


    const {
        rainfall,
        soilMoisture,
        terrain,
        historicalLandslides,
        satellite
    } = monitoringData;


    /*
     * =====================================================
     * RAINFALL FEATURES
     * =====================================================
     */

    const rainfallHistory =
        rainfall?.history || [];


    /*
     * History is ordered newest -> oldest
     * by the rainfall model.
     *
     * We use the latest available observation
     * as our reference time.
     *
     * This avoids depending on the server's current
     * clock when calculating rainfall windows.
     */

    const latestRainfall =
        rainfallHistory.length > 0
            ? rainfallHistory[0]
            : null;


    const referenceTime =
        latestRainfall
            ? new Date(
                  latestRainfall.observation_time
              ).getTime()
            : Date.now();


    /*
     * Calculate rainfall accumulation
     * for the requested number of hours.
     */

    const getRainfallSum = (hours) => {

        const cutoff =
            referenceTime -
            hours * 60 * 60 * 1000;


        return rainfallHistory
            .filter((reading) => {

                const observationTime =
                    new Date(
                        reading.observation_time
                    ).getTime();


                return (
                    observationTime >= cutoff &&
                    observationTime <= referenceTime
                );
            })
            .reduce(
                (
                    sum,
                    reading
                ) => {

                    return (
                        sum +
                        Number(
                            reading.rainfall_mm || 0
                        )
                    );
                },
                0
            );
    };


    const rainfall1h =
        getRainfallSum(1);

    const rainfall3h =
        getRainfallSum(3);

    const rainfall6h =
        getRainfallSum(6);

    const rainfall12h =
        getRainfallSum(12);

    const rainfall24h =
        getRainfallSum(24);


    /*
     * =====================================================
     * SOIL MOISTURE FEATURES
     * =====================================================
     */

    const soilHistory =
        soilMoisture?.history || [];


    /*
     * Get the latest reading for a particular
     * representative depth.
     *
     * Open-Meteo ranges are represented in our
     * database as:
     *
     * 0-1 cm   -> 0.5
     * 1-3 cm   -> 2
     * 3-9 cm   -> 6
     * 9-27 cm  -> 18
     * 27-81 cm -> 54
     */

    const getLatestDepthValue = (
        depthCm
    ) => {

        const reading =
            soilHistory.find(
                (item) =>
                    Number(
                        item.depth_cm
                    ) === depthCm
            );


        if (!reading) {
            return null;
        }


        return Number(
            reading.soil_moisture
        );
    };


    const soilMoisture0_1 =
        getLatestDepthValue(0.5);

    const soilMoisture1_3 =
        getLatestDepthValue(2);

    const soilMoisture3_9 =
        getLatestDepthValue(6);

    const soilMoisture9_27 =
        getLatestDepthValue(18);

    const soilMoisture27_81 =
        getLatestDepthValue(54);


    /*
     * =====================================================
     * TERRAIN FEATURES
     * =====================================================
     */

    const elevation =
        terrain
            ? Number(
                  terrain.elevation_m
              )
            : null;


    const slope =
        terrain
            ? Number(
                  terrain.slope_degree
              )
            : null;


    const aspect =
        terrain
            ? Number(
                  terrain.aspect_degree
              )
            : null;


    /*
     * =====================================================
     * HISTORICAL LANDSLIDE FEATURES
     * =====================================================
     */

    const historicalCount =
        Number(
            historicalLandslides
                ?.historical_landslide_count || 0
        );


    const recentCount =
        Number(
            historicalLandslides
                ?.recent_landslide_count || 0
        );


    const nearestLandslideDistance =
        historicalLandslides
            ?.nearest_landslide_distance_km
            ?? null;


    /*
     * =====================================================
     * SATELLITE FEATURES
     * =====================================================
     *
     * IMPORTANT:
     *
     * We only use satellite metadata here.
     *
     * We DO NOT:
     * - calculate NDVI
     * - process satellite pixels
     * - download imagery
     * - perform satellite prediction
     *
     * That belongs to your friend's system.
     */

    const satelliteCloudCover =
        satellite
            ? Number(
                  satellite.cloud_cover
              )
            : null;


    /*
     * =====================================================
     * FINAL ML-READY FEATURE OBJECT
     * =====================================================
     */

    return {

        /*
         * Location
         */
        latitude,
        longitude,


        /*
         * Rainfall
         */
        rainfall_1h:
            rainfall1h,

        rainfall_3h:
            rainfall3h,

        rainfall_6h:
            rainfall6h,

        rainfall_12h:
            rainfall12h,

        rainfall_24h:
            rainfall24h,


        /*
         * Soil moisture
         */
        soil_moisture_0_1cm:
            soilMoisture0_1,

        soil_moisture_1_3cm:
            soilMoisture1_3,

        soil_moisture_3_9cm:
            soilMoisture3_9,

        soil_moisture_9_27cm:
            soilMoisture9_27,

        soil_moisture_27_81cm:
            soilMoisture27_81,


        /*
         * Terrain
         */
        elevation_m:
            elevation,

        slope_degree:
            slope,

        aspect_degree:
            aspect,


        /*
         * Historical landslides
         */
        historical_landslide_count:
            historicalCount,

        recent_landslide_count:
            recentCount,

        nearest_landslide_distance_km:
            nearestLandslideDistance,


        /*
         * Satellite metadata
         */
        satellite_cloud_cover:
            satelliteCloudCover
    };
};


module.exports = {
    buildEnvironmentalFeatures
};