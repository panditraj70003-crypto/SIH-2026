const pool = require("../../config/db");

const createSatelliteObservation = async ({
    latitude,
    longitude,
    observationTime,
    provider = "DEMO",
    assetId = null,
    imageUrl = null,
    cloudCover = null,
    ndvi = null,
    rawData = null
}) => {
    const query = `
        INSERT INTO satellite_observations (
            latitude,
            longitude,
            observation_time,
            provider,
            asset_id,
            image_url,
            cloud_cover,
            ndvi,
            raw_data
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
    `;

    const values = [
        latitude,
        longitude,
        observationTime,
        provider,
        assetId,
        imageUrl,
        cloudCover,
        ndvi,
        rawData
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


const getLatestSatelliteObservation = async (
    latitude,
    longitude
) => {
    const query = `
        SELECT *
        FROM satellite_observations
        WHERE latitude = $1
          AND longitude = $2
        ORDER BY observation_time DESC
        LIMIT 1;
    `;

    const result = await pool.query(query, [
        latitude,
        longitude
    ]);

    return result.rows[0] || null;
};


const getSatelliteHistory = async (
    latitude,
    longitude,
    limit = 10
) => {
    const query = `
        SELECT *
        FROM satellite_observations
        WHERE latitude = $1
          AND longitude = $2
        ORDER BY observation_time DESC
        LIMIT $3;
    `;

    const result = await pool.query(query, [
        latitude,
        longitude,
        limit
    ]);

    return result.rows;
};


module.exports = {
    createSatelliteObservation,
    getLatestSatelliteObservation,
    getSatelliteHistory
};