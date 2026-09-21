const pool = require("../../config/db");

const createAlert = async (
    reportId,
    alertType,
    recipientType,
    alertMessage
) => {
    const query = `
        INSERT INTO alerts (
            report_id,
            alert_type,
            recipient_type,
            alert_message
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const values = [
        reportId,
        alertType,
        recipientType,
        alertMessage
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};



const updateAlertStatus = async (alertId, status) => {
    const query = `
        UPDATE alerts
        SET status = $1
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [status, alertId]);

    return result.rows[0];
};


const updateReportAlertStatus = async (reportId, status) => {
    const query = `
        UPDATE reports
        SET alert_status = $1
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [status, reportId]);

    return result.rows[0];
};

module.exports = {
    createAlert,
    updateAlertStatus,
    updateReportAlertStatus
};