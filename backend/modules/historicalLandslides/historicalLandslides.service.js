const {
    createHistoricalLandslide,
    getHistoricalLandslides
} = require("./historicalLandslides.model");


const addHistoricalLandslide = async (data) => {

    return await createHistoricalLandslide(
        data
    );
};


const getHistoricalRiskFeatures = async ({
    latitude,
    longitude
}) => {

    const events =
        await getHistoricalLandslides({
            latitude,
            longitude,
            radiusKm: 25
        });


    const now = new Date();

    const fiveYearsAgo =
        new Date(
            now.getFullYear() - 5,
            now.getMonth(),
            now.getDate()
        );


    const recentEvents =
        events.filter(event => {

            return new Date(event.event_date)
                >= fiveYearsAgo;

        });


    const nearestDistance =
        events.length > 0
            ? Number(
                events[0].distance_km
            )
            : null;


    return {

        historical_landslide_count:
            events.length,

        recent_landslide_count:
            recentEvents.length,

        nearest_landslide_distance_km:
            nearestDistance !== null
                ? Number(
                    nearestDistance.toFixed(2)
                )
                : null
    };
};


const findNearbyLandslides = async ({
    latitude,
    longitude,
    radiusKm = 25
}) => {

    return await getHistoricalLandslides({
        latitude,
        longitude,
        radiusKm
    });
};


module.exports = {
    addHistoricalLandslide,
    getHistoricalRiskFeatures,
    findNearbyLandslides
};