
const reportsModel = require("./reports.model");

const createReport = async (
    userId,
    latitude,
    longitude,
    description,
    severity
) => {
    // Validate coordinates
    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
    ) {
        throw new Error("Valid latitude and longitude are required");
    }

    if (latitude < -90 || latitude > 90) {
        throw new Error("Invalid latitude");
    }

    if (longitude < -180 || longitude > 180) {
        throw new Error("Invalid longitude");
    }

    // Validate description
    if (!description || description.trim().length < 10) {
        throw new Error(
            "Description must contain at least 10 characters"
        );
    }

    // Validate severity
    const allowedSeverities = ["low", "medium", "high"];

    if (!allowedSeverities.includes(severity)) {
        throw new Error(
            "Severity must be low, medium, or high"
        );
    }

    const report = await reportsModel.createReport(
        userId,
        latitude,
        longitude,
        description.trim(),
        severity
    );

    return report;
};


const getMyReports = async (userId) => {
    const reports = await reportsModel.getReportsByUserId(userId);

    return reports;
};

module.exports = {
    createReport,
    getMyReports
};