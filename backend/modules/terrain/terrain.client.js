const axios = require("axios");

const ELEVATION_API =
    "https://api.open-meteo.com/v1/elevation";


const getTerrainElevations = async (
    latitude,
    longitude
) => {

    // Approx. 100 meters north/south
    const latOffset = 0.0009;

    // Approx. 100 meters east/west at this latitude
    const lonOffset =
        0.0009 / Math.cos(
            latitude * Math.PI / 180
        );


    const points = [
        {
            name: "center",
            latitude,
            longitude
        },
        {
            name: "north",
            latitude: latitude + latOffset,
            longitude
        },
        {
            name: "south",
            latitude: latitude - latOffset,
            longitude
        },
        {
            name: "east",
            latitude,
            longitude: longitude + lonOffset
        },
        {
            name: "west",
            latitude,
            longitude: longitude - lonOffset
        }
    ];


    try {

        const response = await axios.get(
            ELEVATION_API,
            {
                params: {
                    latitude: points
                        .map(point => point.latitude)
                        .join(","),

                    longitude: points
                        .map(point => point.longitude)
                        .join(",")
                },

                timeout: 10000
            }
        );


        const elevations =
            response.data.elevation;


        if (
            !Array.isArray(elevations) ||
            elevations.length !== points.length
        ) {
            throw new Error(
                "Invalid elevation response"
            );
        }


        return {
            center: elevations[0],
            north: elevations[1],
            south: elevations[2],
            east: elevations[3],
            west: elevations[4]
        };

    } catch (error) {

        console.error(
            "Terrain elevation API error:",
            error.response?.data ||
            error.message
        );

        throw new Error(
            "Failed to fetch terrain elevations"
        );
    }
};


module.exports = {
    getTerrainElevations
};