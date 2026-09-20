const {
    saveTerrain,
    getTerrain
} = require("./terrain.model");

const {
    getTerrainElevations
} = require("./terrain.client");


const calculateTerrainMetrics = ({
    north,
    south,
    east,
    west
}) => {

    /*
        Our sampling distance is approximately
        100 meters in each direction.
    */

    const distance = 100;


    // Elevation gradient from west → east
    const dzdx =
        (east - west) /
        (2 * distance);


    // Elevation gradient from south → north
    const dzdy =
        (north - south) /
        (2 * distance);


    /*
        Slope is the angle of the terrain
        relative to horizontal.
    */

    const gradient =
        Math.sqrt(
            (dzdx * dzdx) +
            (dzdy * dzdy)
        );


    const slopeRadians =
        Math.atan(gradient);


    const slopeDegree =
        slopeRadians * 180 / Math.PI;


    /*
        Aspect represents the direction
        the slope faces.

        0°   = North
        90°  = East
        180° = South
        270° = West
    */

    let aspectDegree =
        Math.atan2(
            dzdx,
            -dzdy
        ) * 180 / Math.PI;


    if (aspectDegree < 0) {
        aspectDegree += 360;
    }


    return {
        slopeDegree: Number(
            slopeDegree.toFixed(2)
        ),

        aspectDegree: Number(
            aspectDegree.toFixed(2)
        )
    };
};


const fetchAndSaveTerrain = async (
    latitude,
    longitude
) => {

    const existingTerrain =
        await getTerrain(
            latitude,
            longitude
        );


    /*
        If terrain already exists and contains
        slope/aspect, use the stored data.
    */

    if (
        existingTerrain &&
        existingTerrain.slope_degree !== null &&
        existingTerrain.aspect_degree !== null
    ) {

        return existingTerrain;
    }


    const elevations =
        await getTerrainElevations(
            latitude,
            longitude
        );


    const metrics =
        calculateTerrainMetrics(
            elevations
        );


    const terrain =
        await saveTerrain({
            latitude,
            longitude,

            elevationM:
                elevations.center,

            slopeDegree:
                metrics.slopeDegree,

            aspectDegree:
                metrics.aspectDegree,

            source: "OPEN_METEO",

            rawData: elevations
        });


    return terrain;
};


const getTerrainData = async (
    latitude,
    longitude
) => {

    return await getTerrain(
        latitude,
        longitude
    );
};


module.exports = {
    fetchAndSaveTerrain,
    getTerrainData
};