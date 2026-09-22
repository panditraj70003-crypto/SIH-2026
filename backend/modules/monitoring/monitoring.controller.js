const {
    getLocationMonitoringData
} = require("./monitoring.service");


const getMonitoringData = async (req, res) => {

    try {

        const {
            latitude,
            longitude
        } = req.params;

        const lat = Number(latitude);
        const lon = Number(longitude);


        if (
            Number.isNaN(lat) ||
            Number.isNaN(lon)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid latitude and longitude are required"
            });
        }


        const data =
            await getLocationMonitoringData(
                lat,
                lon
            );


        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        console.error(
            "Get monitoring data error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getMonitoringData
};