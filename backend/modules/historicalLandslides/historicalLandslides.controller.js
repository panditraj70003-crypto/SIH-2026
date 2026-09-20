const {
    addHistoricalLandslide,
    findNearbyLandslides,
    getHistoricalRiskFeatures
} = require("./historicalLandslides.service");


const createLandslide = async (req, res) => {

    const landslide =
        await addHistoricalLandslide(
            req.body
        );


    res.status(201).json({
        success: true,
        message:
            "Historical landslide added successfully",
        data: landslide
    });
};


const getNearbyLandslides = async (
    req,
    res
) => {

    const {
        latitude,
        longitude
    } = req.params;


    const radius =
        Number(req.query.radius) || 25;


    const events =
        await findNearbyLandslides({
            latitude: Number(latitude),
            longitude: Number(longitude),
            radiusKm: radius
        });


    res.status(200).json({
        success: true,
        count: events.length,
        data: events
    });
};


const getRiskFeatures = async (
    req,
    res
) => {

    const {
        latitude,
        longitude
    } = req.params;


    const features =
        await getHistoricalRiskFeatures({
            latitude: Number(latitude),
            longitude: Number(longitude)
        });


    res.status(200).json({
        success: true,
        data: features
    });
};


module.exports = {
    createLandslide,
    getNearbyLandslides,
    getRiskFeatures
};