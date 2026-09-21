const pool = require("../../config/db");

const createSoilMoistureReading = async ({
    latitude,
    longitude,
    soilMoisture,
    observationTime,
    depthCm,
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
    ON CONFLICT (
        latitude,
        longitude,
        observation_time,
        depth_cm
    )
    DO UPDATE SET
        soil_moisture = EXCLUDED.soil_moisture,
        source = EXCLUDED.source,
        raw_data = EXCLUDED.raw_data
    RETURNING *
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

    const result =
        await pool.query(query, values);

    return result.rows[0];
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
        LIMIT 1
    `;

    const result =
        await pool.query(
            query,
            [latitude, longitude]
        );

    return result.rows[0] || null;
};


const getSoilMoistureHistory = async (
    latitude,
    longitude,
    limit = 100
) => {

    const query = `
        SELECT *
        FROM soil_moisture_readings
        WHERE latitude = $1
          AND longitude = $2
        ORDER BY observation_time DESC
        LIMIT $3
    `;

    const result =
        await pool.query(
            query,
            [latitude, longitude, limit]
        );

    return result.rows;
};


module.exports = {
    createSoilMoistureReading,
    getLatestSoilMoisture,
    getSoilMoistureHistory
};