const pool = require("../../config/db");

const createRainfallReading = async ({
    latitude,
    longitude,
    rainfallMm,
    observationTime,
    district,
    state,
    source = "DEMO",
    rawData = null
}) => {
    const query = `
        INSERT INTO rainfall_readings (
            latitude,
            longitude,
            rainfall_mm,
            observation_time,
            district,
            state,
            source,
            raw_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    const values = [
        latitude,
        longitude,
        rainfallMm,
        observationTime,
        district,
        state,
        source,
        rawData
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
};


const getLatestRainfallReading = async (latitude, longitude) => {
    const query = `
        SELECT *
        FROM rainfall_readings
        WHERE latitude = $1
          AND longitude = $2
        ORDER BY observation_time DESC
        LIMIT 1;
    `;

    const values = [latitude, longitude];

    const { rows } = await pool.query(query, values);

    return rows[0] || null;
};


const getRainfallHistory = async (
    latitude,
    longitude,
    limit = 24
) => {
    const query = `
        SELECT *
        FROM rainfall_readings
        WHERE latitude = $1
          AND longitude = $2
        ORDER BY observation_time DESC
        LIMIT $3;
    `;

    const values = [latitude, longitude, limit];

    const { rows } = await pool.query(query, values);

    return rows;
};

const getRainfallAccumulation = async (
    latitude,
    longitude
) => {

    const query = `
        SELECT

            COALESCE(
                SUM(
                    CASE
                        WHEN observation_time >= NOW() - INTERVAL '1 hour'
                        THEN rainfall_mm
                        ELSE 0
                    END
                ),
                0
            ) AS rainfall_1h,

            COALESCE(
                SUM(
                    CASE
                        WHEN observation_time >= NOW() - INTERVAL '3 hours'
                        THEN rainfall_mm
                        ELSE 0
                    END
                ),
                0
            ) AS rainfall_3h,

            COALESCE(
                SUM(
                    CASE
                        WHEN observation_time >= NOW() - INTERVAL '6 hours'
                        THEN rainfall_mm
                        ELSE 0
                    END
                ),
                0
            ) AS rainfall_6h,

            COALESCE(
                SUM(
                    CASE
                        WHEN observation_time >= NOW() - INTERVAL '12 hours'
                        THEN rainfall_mm
                        ELSE 0
                    END
                ),
                0
            ) AS rainfall_12h,

            COALESCE(
                SUM(
                    CASE
                        WHEN observation_time >= NOW() - INTERVAL '24 hours'
                        THEN rainfall_mm
                        ELSE 0
                    END
                ),
                0
            ) AS rainfall_24h

        FROM rainfall_readings

        WHERE latitude = $1
          AND longitude = $2;
    `;


    const values = [
        latitude,
        longitude
    ];


    const { rows } = await pool.query(
        query,
        values
    );


    return rows[0];
};


module.exports = {
    createRainfallReading,
    getLatestRainfallReading,
    getRainfallHistory,
    getRainfallAccumulation,
};