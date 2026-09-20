const pool = require("../../config/db");


const createHistoricalLandslide = async ({
    latitude,
    longitude,
    eventDate,
    district = null,
    state = null,
    severity = null,
    source = "DEMO",
    description = null,
    rawData = null
}) => {

    const query = `
        INSERT INTO historical_landslides (
            latitude,
            longitude,
            event_date,
            district,
            state,
            severity,
            source,
            description,
            raw_data
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9
        )
        RETURNING *;
    `;


    const values = [
        latitude,
        longitude,
        eventDate,
        district,
        state,
        severity,
        source,
        description,
        rawData
    ];


    const { rows } = await pool.query(
        query,
        values
    );


    return rows[0];
};


const getHistoricalLandslides = async ({
    latitude,
    longitude,
    radiusKm = 25
}) => {

    /*
        Approximate geographic distance calculation.

        We use PostgreSQL math for now.
        Later we can replace this with PostGIS.
    */

    const query = `
        SELECT
            *,
            (
                6371 * acos(
                    LEAST(
                        1,
                        GREATEST(
                            -1,
                            cos(radians($1))
                            *
                            cos(radians(latitude))
                            *
                            cos(
                                radians(longitude)
                                -
                                radians($2)
                            )
                            +
                            sin(radians($1))
                            *
                            sin(radians(latitude))
                        )
                    )
                )
            ) AS distance_km

        FROM historical_landslides

        WHERE (
            6371 * acos(
                LEAST(
                    1,
                    GREATEST(
                        -1,
                        cos(radians($1))
                        *
                        cos(radians(latitude))
                        *
                        cos(
                            radians(longitude)
                            -
                            radians($2)
                        )
                        +
                        sin(radians($1))
                        *
                        sin(radians(latitude))
                    )
                )
            )
        ) <= $3

        ORDER BY distance_km ASC;
    `;


    const values = [
        latitude,
        longitude,
        radiusKm
    ];


    const { rows } = await pool.query(
        query,
        values
    );


    return rows;
};


module.exports = {
    createHistoricalLandslide,
    getHistoricalLandslides
};