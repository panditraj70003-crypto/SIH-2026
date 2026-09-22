const pool = require("../../config/db");

const getRiskLocations = async (riskLevel = null) => {
    let query = `
        SELECT
            id,
            latitude,
            longitude,
            severity,
            risk_level,
            ai_status,
            ai_confidence,
            description,
            created_at
        FROM reports
        WHERE risk_level IS NOT NULL
    `;

    const values = [];

    if (riskLevel) {
        query += ` AND risk_level = $1`;
        values.push(riskLevel);
    }

    query += ` ORDER BY created_at DESC;`;

    const result = await pool.query(query, values);

    return result.rows;
};

const getRiskSummary = async () => {
    const query = `
        SELECT
            COUNT(*) AS total_reports,

            COUNT(*) FILTER (
                WHERE risk_level = 'low'
            ) AS low_count,

            COUNT(*) FILTER (
                WHERE risk_level = 'medium'
            ) AS medium_count,

            COUNT(*) FILTER (
                WHERE risk_level = 'high'
            ) AS high_count,

            COUNT(*) FILTER (
                WHERE risk_level = 'critical'
            ) AS critical_count

        FROM reports
        WHERE risk_level IS NOT NULL;
    `;

    const result = await pool.query(query);

    return result.rows[0];
};

const getRiskLocationById = async (id) => {
    const query = `
        SELECT
            id,
            latitude,
            longitude,
            severity,
            risk_level,
            ai_status,
            ai_confidence,
            description,
            alert_status,
            created_at
        FROM reports
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

module.exports = {
    getRiskLocations,
    getRiskSummary,
    getRiskLocationById,
};