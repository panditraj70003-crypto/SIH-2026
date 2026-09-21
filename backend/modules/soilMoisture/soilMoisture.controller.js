const {
    saveSoilMoistureReading,
    fetchLatestSoilMoisture,
    fetchSoilMoistureHistory
} = require("./soilMoisture.service");


const createSoilMoisture = async (
    req,
    res
) => {

    const {
        latitude,
        longitude,
        soilMoisture,
        observationTime,
        depthCm,
        source,
        rawData
    } = req.body;


    const reading =
        await saveSoilMoistureReading({
            latitude,
            longitude,
            soilMoisture,
            observationTime,
            depthCm,
            source,
            rawData
        });


    res.status(201).json({
        success: true,
        message:
            "Soil moisture reading created successfully",
        data: reading
    });
};


const getLatest = async (
    req,
    res
) => {

    const {
        latitude,
        longitude
    } = req.params;


    const reading =
        await fetchLatestSoilMoisture(
            Number(latitude),
            Number(longitude)
        );


    if (!reading) {

        return res.status(404).json({
            success: false,
            message:
                "No soil moisture data found"
        });
    }


    res.status(200).json({
        success: true,
        data: reading
    });
};


const getHistory = async (
    req,
    res
) => {

    const {
        latitude,
        longitude
    } = req.params;


    const limit =
        Number(req.query.limit) || 24;


    const readings =
        await fetchSoilMoistureHistory(
            Number(latitude),
            Number(longitude),
            limit
        );


    res.status(200).json({
        success: true,
        count: readings.length,
        data: readings
    });
};


module.exports = {
    createSoilMoisture,
    getLatest,
    getHistory
};