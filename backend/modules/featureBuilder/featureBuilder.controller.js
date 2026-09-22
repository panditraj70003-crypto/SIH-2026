const {
    buildEnvironmentalFeatures
} = require("./featureBuilder.service");

const getEnvironmentalFeatures = async (
    req,
    res
) => {
    try {
        const { latitude, longitude } =
            req.params;

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

        const features =
            await buildEnvironmentalFeatures(
                lat,
                lon
            );

        res.status(200).json({
            success: true,
            data: features
        });
    } catch (error) {
        console.error(
            "Get environmental features error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getEnvironmentalFeatures
};