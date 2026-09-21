const {
    createSatelliteObservation,
    getLatestSatelliteObservation,
    getSatelliteHistory
} = require("./satellite.model");


const {
    searchSentinel2,
    extractBandAssets
} = require("./satellite.client");



/*
==========================================================
1. MANUAL SATELLITE OBSERVATION
==========================================================
*/

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


    if (
        latitude === undefined ||
        longitude === undefined ||
        !observationTime
    ) {
        throw new Error(
            "Latitude, longitude and observationTime are required"
        );
    }


    return await createSatelliteObservation({

        latitude,

        longitude,

        observationTime,

        provider: provider || "DEMO",

        assetId: assetId || null,

        imageUrl: imageUrl || null,

        cloudCover:
            cloudCover !== undefined
                ? cloudCover
                : null,

        ndvi:
            ndvi !== undefined
                ? ndvi
                : null,

        rawData:
            rawData || null
    });
};




/*
==========================================================
2. SEARCH COPERNICUS SATELLITE DATA
==========================================================
*/

const searchSatelliteData = async ({
    latitude,
    longitude,
    daysBack = 30,
    maxCloudCover = 30,
    limit = 5
}) => {

    const result = await searchSentinel2({

        latitude,

        longitude,

        daysBack,

        maxCloudCover,

        limit
    });


    return result;
};




/*
==========================================================
3. FETCH LATEST SENTINEL-2 DATA
   AND STORE IT IN DATABASE
==========================================================
*/

const fetchAndStoreLatestSatellite = async ({
    latitude,
    longitude,
    daysBack = 30,
    maxCloudCover = 30
}) => {


    /*
        Ask Copernicus STAC for Sentinel-2 data
    */

    const result = await searchSentinel2({

        latitude,

        longitude,

        daysBack,

        maxCloudCover,

        limit: 1
    });



    /*
        No satellite image found
    */

    if (
        !result.features ||
        result.features.length === 0
    ) {

        return null;
    }



    /*
        Get the latest Sentinel-2 item
    */

    const feature =
        result.features[0];



    /*
        Extract metadata
    */

    const properties =
        feature.properties || {};



    /*
        Observation time
    */

    const observationTime =
        properties.datetime ||
        properties["start_datetime"];



    /*
        Cloud cover
    */

    const cloudCover =
        properties["eo:cloud_cover"] ??
        null;



    /*
        Sentinel-2 asset/product ID
    */

    const assetId =
        feature.id || null;



    /*
        Extract B04 and B08
    */

    const bandAssets =
        extractBandAssets(feature);



    /*
        For now we store the Red band's
        URL as imageUrl.

        Later we will handle authenticated
        band downloads properly.
    */

    const imageUrl =
        bandAssets.red?.href ||
        null;



    /*
        Store complete satellite information.

        landsafe_bands gives us a clean place
        to access B04 and B08 later.
    */

    const rawData = {

        ...feature,

        landsafe_bands: {

            red: bandAssets.red,

            nir: bandAssets.nir
        }
    };



    /*
        Save observation to PostgreSQL
    */

    const observation =
        await createSatelliteObservation({

            latitude,

            longitude,

            observationTime,

            provider:
                "COPERNICUS_SENTINEL_2",

            assetId,

            imageUrl,

            cloudCover,

            ndvi: null,

            rawData
        });



    return observation;
};




/*
==========================================================
4. GET LATEST STORED SATELLITE DATA
==========================================================
*/

const getLatestSatellite = async (
    latitude,
    longitude
) => {

    return await getLatestSatelliteObservation(
        latitude,
        longitude
    );
};




/*
==========================================================
5. GET SATELLITE HISTORY
==========================================================
*/

const getSatelliteObservations = async (
    latitude,
    longitude,
    limit = 10
) => {

    return await getSatelliteHistory(
        latitude,
        longitude,
        limit
    );
};




module.exports = {

    addSatelliteObservation,

    searchSatelliteData,

    fetchAndStoreLatestSatellite,

    getLatestSatellite,

    getSatelliteObservations

};