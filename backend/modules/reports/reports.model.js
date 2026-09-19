const pool = require("../../config/db");

const createReport = async (
    userId,
    latitude,
    longitude,
    description,
    severity,
    imageUrl,
    aiStatus,
    aiConfidence,
    aiObservations,
    riskLevel,
    alertStatus
) => {
    const query = `
        INSERT INTO reports (
            user_id,
            latitude,
            longitude,
            description,
            severity,
            image_url,
            ai_status,
            ai_confidence,
            ai_observations,
            risk_level,
            alert_status
        )
        VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11
        )
        RETURNING *;
    `;

    const values = [
        userId,
        latitude,
        longitude,
        description,
        severity,
        imageUrl,
        aiStatus,
        aiConfidence,
        aiObservations,
        riskLevel,
        alertStatus
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
            risk_level,
            alert_status,
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