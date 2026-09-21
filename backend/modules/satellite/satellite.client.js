const STAC_URL =
    "https://stac.dataspace.copernicus.eu/v1/search";


const searchSentinel2 = async ({
    latitude,
    longitude,
    daysBack = 30,
    maxCloudCover = 30,
    limit = 5
}) => {

    if (
        latitude === undefined ||
        longitude === undefined
    ) {
        throw new Error(
            "Latitude and longitude are required"
        );
    }


    const endDate = new Date();

    const startDate = new Date(
        endDate.getTime() -
        daysBack * 24 * 60 * 60 * 1000
    );


    const body = {

        collections: [
            "sentinel-2-l2a"
        ],

        datetime:
            `${startDate.toISOString()}/${endDate.toISOString()}`,

        intersects: {

            type: "Point",

            coordinates: [
                Number(longitude),
                Number(latitude)
            ]
        },

        query: {

            "eo:cloud_cover": {
                lte: Number(maxCloudCover)
            }
        },

        sortby: [

            {
                field: "datetime",
                direction: "desc"
            }

        ],

        limit: Number(limit)
    };


    const response = await fetch(
        STAC_URL,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(body)
        }
    );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Copernicus STAC request failed: ${response.status} ${errorText}`
        );
    }


    return await response.json();
};



/*
==========================================================
EXTRACT REQUIRED SENTINEL-2 BANDS
==========================================================

B04 = Red
B08 = NIR

Both are 10m resolution.
==========================================================
*/

const extractBandAssets = (feature) => {

    if (!feature || !feature.assets) {

        return {
            red: null,
            nir: null
        };
    }


    const assets = feature.assets;


    const redAsset =
        assets.B04_10m ||
        assets.B04 ||
        null;


    const nirAsset =
        assets.B08_10m ||
        assets.B08 ||
        null;



    const normalizeBand = (
        asset,
        band,
        resolution
    ) => {

        if (!asset) {
            return null;
        }


        const httpsUrl =
            asset.alternate?.https?.href ||
            null;


        return {

            band,

            resolution,

            href:
                httpsUrl ||
                asset.href ||
                null,

            storageHref:
                asset.href ||
                null,

            requiresAuth:
                asset.alternate
                    ?.https
                    ?.["auth:refs"]
                    ?.includes("oidc") ||
                false
        };
    };



    return {

        red: normalizeBand(
            redAsset,
            "B04",
            10
        ),

        nir: normalizeBand(
            nirAsset,
            "B08",
            10
        )

    };
};



module.exports = {

    searchSentinel2,

    extractBandAssets

};