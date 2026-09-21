const {
    updateReportAlertStatus
} = require("./reports.model");



const {
    createAlert,
    updateAlertStatus
} = require("./alerts.model");

const {
    sendAlertEmail
} = require("../../services/email.service");

const createRiskAlert = async (report) => {
    if (
        report.risk_level !== "high" &&
        report.risk_level !== "critical"
    ) {
        return null;
    }

    const message = `Warning: Potential landslide detected near latitude ${report.latitude}, longitude ${report.longitude}.`;

    // 1. Create alert in database
    const alert = await createAlert(
        report.id,
        "landslide_warning",
        "authority",
        message
    );

    // 2. Send automatic email
    try {
        await sendAlertEmail(
            process.env.AUTHORITY_EMAIL,
            "LandSafe: Landslide Warning",
            message
        );

        await updateAlertStatus(alert.id, "sent");
        await updateReportAlertStatus(report.id, "sent");

        alert.status = "sent";
        report.alert_status = "sent";

        console.log("Authority email sent successfully");

    } catch (error) {
        await updateAlertStatus(alert.id, "failed");

        await updateReportAlertStatus(report.id, "failed");

        alert.status = "failed";
        report.alert_status = "failed";

        console.error("Email sending failed:", error.message);
    }

    return alert;
};

module.exports = {
    createRiskAlert
};