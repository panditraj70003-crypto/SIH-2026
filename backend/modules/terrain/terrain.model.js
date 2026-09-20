const pool = require("../../config/db");


const saveTerrain = async ({
    latitude,
    longitude,
    elevationM,
    slopeDegree = null,
    aspectDegree = null,
    source = "OPEN_METEO",
    rawData = null
}) => {

    const query = `
        INSERT INTO terrain_readings (
            latitude,
            longitude,
            elevation_m,
            slope_degree,
            aspect_degree,
            source,
            raw_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (latitude, longitude)
        DO UPDATE SET
            elevation_m = EXCLUDED.elevation_m,
            slope_degree = EXCLUDED.slope_degree,
            aspect_degree = EXCLUDED.aspect_degree,
            source = EXCLUDED.source,
            raw_data = EXCLUDED.raw_data
        RETURNING *;
    `;


    const values = [
        latitude,
        longitude,
        elevationM,
        slopeDegree,
        aspectDegree,
        source,
        rawData
    ];


    const { rows } = await pool.query(
        query,
        values
    );


    return rows[0];
};


const getTerrain = async (
    latitude,
    longitude
) => {

    const query = `
        SELECT *
        FROM terrain_readings
        WHERE latitude = $1
          AND longitude = $2
        LIMIT 1;
    `;


    const { rows } = await pool.query(
        query,
        [latitude, longitude]
    );


    return rows[0] || null;
};


module.exports = {
    saveTerrain,
    getTerrain
};