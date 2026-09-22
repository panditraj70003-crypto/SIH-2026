require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");
const seedRainfall = require("./modules/rainfall/rainfall.seed");
const seedHistoricalLandslides =require("./modules/historicalLandslides/historicalLandslides.seed");
const seedSatellite = require("./modules/satellite/satellite.seed");
const seedSoilMoisture =
    require("./modules/soilMoisture/soilMoisture.seed");


const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await pool.query("SELECT NOW()");

        console.log("Database connection successful");

        //await seedRainfall();
        await seedHistoricalLandslides();
        //await seedSatellite();
        //await seedSoilMoisture();

        app.listen(PORT, () => {
            console.log(`LandSafe server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

startServer();