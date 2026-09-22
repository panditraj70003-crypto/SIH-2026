const {
    fetchAndStoreSoilMoisture
} = require("./soilMoisture.service");

const NER_LOCATIONS =
    require("../locations/nerLocations");


const seedSoilMoisture = async () => {

    for (const location of NER_LOCATIONS) {

        try {

            const result =
                await fetchAndStoreSoilMoisture({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    pastHours: 24
                });

            console.log(
                `Soil moisture fetched for ${location.name}: ${result.count} readings`
            );

        } catch (error) {

            console.error(
                `Soil moisture fetch failed for ${location.name}:`,
                error.message
            );
        }
    }
};


module.exports = seedSoilMoisture;