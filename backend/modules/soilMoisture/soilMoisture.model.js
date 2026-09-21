const pool = require("../../config/db");


const createSoilMoistureReading = async ({
    latitude,
    longitude,
    soilMoisture,
    observationTime,
    depthCm = null,
    source = "DEMO",
    rawData = null
}) => {

    const query = `
        INSERT INTO soil_moisture_readings (
            latitude,
            longitude,
            soil_moisture,
            observation_time,
            depth_cm,
            source,
            raw_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const values = [
        latitude,
        longitude,
        soilMoisture,
        observationTime,
        depthCm,
        source,
        rawData
    ];

    const { rows } = await pool.query(
        query,
        values
    );

    return rows[0];
};


const getLatestSoilMoisture = async (
    latitude,
    longitude
) => {

    const query = `
        SELECT *
        FROM soil_moisture_readings
        WHERE latitude = $1
          AND longitude = $2
        ORDER BY observation_time DESC
        LIMIT 1;
    `;

    const { rows } = await pool.query(
        query,
        [latitude, longitude]
    );

    return rows[0] || null;
};


const getSoilMoistureHistory = async (
    latitude,
    longitude,
    limit = 24
) => {

    const query = `
        SELECT *
        FROM soil_moisture_readings
        WHERE latitude = $1
          AND longitude = $2
        ORDER BY observation_time DESC
        LIMIT $3;
    `;

    const { rows } = await pool.query(
        query,
        [latitude, longitude, limit]
    );

    return rows;
};


module.exports = {
    createSoilMoistureReading,
    getLatestSoilMoisture,
    getSoilMoistureHistory
};