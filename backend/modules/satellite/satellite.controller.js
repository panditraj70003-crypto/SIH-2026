const {
    addSatelliteObservation,
    searchSatelliteData,
    fetchAndStoreLatestSatellite,
    getLatestSatellite,
    getSatelliteObservations
} = require("./satellite.service");



/*
==========================================================
1. CREATE SATELLITE OBSERVATION
==========================================================
*/

const createSatelliteObservation = async (req, res) => {

    try {

        const observation =
            await addSatelliteObservation(req.body);


        res.status(201).json({
            success: true,
            data: observation
        });

    } catch (error) {

        console.error(
            "Create satellite observation error:",
            error
        );


        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



/*
==========================================================
2. GET LATEST STORED OBSERVATION
==========================================================
*/

const getLatestSatelliteObservation = async (
    req,
    res
) => {

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


        res.json({
            success: true,
            data: observation
        });

    } catch (error) {

        console.error(
            "Get satellite observation error:",
            error
        );


        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



/*
==========================================================
3. GET SATELLITE HISTORY
==========================================================
*/

const getSatelliteHistoryData = async (
    req,
    res
) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;


        const limit =
            Number(req.query.limit) || 10;


        const observations =
            await getSatelliteObservations(
                Number(latitude),
                Number(longitude),
                limit
            );


        res.json({
            success: true,
            data: observations
        });

    } catch (error) {

        console.error(
            "Get satellite history error:",
            error
        );


        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



/*
==========================================================
4. SEARCH COPERNICUS
==========================================================
*/

const searchSatellite = async (
    req,
    res
) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;


        const {
            daysBack = 30,
            maxCloudCover = 30,
            limit = 5
        } = req.query;


        const result =
            await searchSatelliteData({

                latitude: Number(latitude),

                longitude: Number(longitude),

                daysBack: Number(daysBack),

                maxCloudCover:
                    Number(maxCloudCover),

                limit: Number(limit)
            });


        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "Search satellite error:",
            error
        );


        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



/*
==========================================================
5. FETCH + STORE LATEST SATELLITE DATA
==========================================================
*/

const fetchLatestSatellite = async (
    req,
    res
) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;


        const {
            daysBack = 30,
            maxCloudCover = 30
        } = req.query;


        const observation =
            await fetchAndStoreLatestSatellite({

                latitude: Number(latitude),

                longitude: Number(longitude),

                daysBack: Number(daysBack),

                maxCloudCover:
                    Number(maxCloudCover)
            });


        if (!observation) {

            return res.status(404).json({

                success: false,

                message:
                    "No Sentinel-2 satellite data found"
            });
        }


        /*
            Clean integration response
        */

        const rawData =
            observation.raw_data || {};

        const bands =
            rawData.landsafe_bands || {};


        res.json({

            success: true,

            data: {

                id: observation.id,

                latitude:
                    observation.latitude,

                longitude:
                    observation.longitude,

                observationTime:
                    observation.observation_time,

                provider:
                    observation.provider,

                assetId:
                    observation.asset_id,

                cloudCover:
                    observation.cloud_cover,

                bands: {

                    red:
                        bands.red || null,

                    nir:
                        bands.nir || null
                }
            }
        });

    } catch (error) {

        console.error(
            "Fetch satellite error:",
            error
        );


        res.status(500).json({

            success: false,

            message: error.message
        });
    }
};



module.exports = {

    createSatelliteObservation,

    getLatestSatelliteObservation,

    getSatelliteHistoryData,

    searchSatellite,

    fetchLatestSatellite

};