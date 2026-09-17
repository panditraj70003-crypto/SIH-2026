
const pool = require("../../config/db");

const createReport = async (
    userId,
    latitude,
    longitude,
    description,
    severity
) => {
    const query = `
        INSERT INTO reports (
            user_id,
            latitude,
            longitude,
            description,
            severity
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [
        userId,
        latitude,
        longitude,
        description,
        severity
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};



const getReportsByUserId = async (userId) => {
    const query = `
        SELECT
            id,
            latitude,
            longitude,
            description,
            severity,
            status,
            created_at
        FROM reports
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;
};

module.exports = {
    createReport,
    getReportsByUserId
};

