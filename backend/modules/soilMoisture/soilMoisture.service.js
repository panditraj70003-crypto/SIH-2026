const {
    fetchSoilMoisture
} = require("./soilMoisture.client");

const {
    createSoilMoistureReading
} = require("./soilMoisture.model");

const fetchAndStoreSoilMoisture = async ({
    latitude,
    longitude,
    pastHours = 24
}) => {

    const result =
        await fetchSoilMoisture({
            latitude,
            longitude,
            pastHours
        });

    const observations = [];

    for (const reading of result.soilMoisture) {

        const depths = [
            {
                moisture:
                    reading.moisture_0_1cm,
                depthCm: 0.5
            },
            {
                moisture:
                    reading.moisture_1_3cm,
                depthCm: 2
            },
            {
                moisture:
                    reading.moisture_3_9cm,
                depthCm: 6
            },
            {
                moisture:
                    reading.moisture_9_27cm,
                depthCm: 18
            },
            {
                moisture:
                    reading.moisture_27_81cm,
                depthCm: 54
            }
        ];

        for (const depth of depths) {

            if (depth.moisture === null) {
                continue;
            }

            const observation =
                await createSoilMoistureReading({
                    latitude,
                    longitude,

                    soilMoisture:
                        depth.moisture,

observationTime:
    new Date(
        `${reading.observationTime}:00Z`
    ),

                    depthCm:
                        depth.depthCm,

                    source:
                        "OPEN_METEO",

                    rawData: {
                        provider:
                            "OPEN_METEO",

                        gridLatitude:
                            result.latitude,

                        gridLongitude:
                            result.longitude,

                        elevation:
                            result.elevation,

                        observationTime:
                            reading.observationTime,

                        depthRange:
                            getDepthRange(
                                depth.depthCm
                            ),

                        soilMoisture:
                            depth.moisture
                    }
                });

            observations.push(
                observation
            );
        }
    }

    return {
        latitude,
        longitude,

        source: "OPEN_METEO",

        count:
            observations.length,

        observations
    };
};


const getDepthRange = (depthCm) => {

    if (depthCm === 0.5) {
        return "0-1cm";
    }

    if (depthCm === 2) {
        return "1-3cm";
    }

    if (depthCm === 6) {
        return "3-9cm";
    }

    if (depthCm === 18) {
        return "9-27cm";
    }

    if (depthCm === 54) {
        return "27-81cm";
    }

    return null;
};


module.exports = {
    fetchAndStoreSoilMoisture
};

if (require.main === module) {

    fetchAndStoreSoilMoisture({
        latitude: 25.5788,
        longitude: 91.8933,
        pastHours: 24
    })
        .then((data) => {

            console.log(
                JSON.stringify(data, null, 2)
            );

            process.exit(0);
        })
        .catch((error) => {

            console.error(
                "Soil moisture service test failed:",
                error
            );

            process.exit(1);
        });
}