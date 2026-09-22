const reportsModel = require("./reports.model");

const { createRiskAlert } = require("./alerts.service");
 

const {
    verifyReportWithAI
} = require("../../services/ai.service");

const {
    calculateRiskLevel
} = require("../../services/risk.service");

const {
    determineAlertStatus
} = require("../../services/alert.service");

const createReport = async (
    userId,
    latitude,
    longitude,
    description,
    severity,
    imagePath
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

    if (!imagePath) {
        throw new Error("Image is required");
    }

    // Step 1: Send image to AI service
    const aiResult = await verifyReportWithAI(
        imagePath,
        description.trim()
    );

    const riskLevel = calculateRiskLevel(
    severity,
    aiResult.ai_confidence
);
const alertStatus = determineAlertStatus(riskLevel);



console.log("Risk Level:", riskLevel);
console.log("Alert Status:", alertStatus);


    // Step 2: Save report with AI result
   const report = await reportsModel.createReport(
    userId,
    latitude,
    longitude,
    description.trim(),
    severity,
    imagePath,
    aiResult.ai_status || "needs_more_evidence",
    aiResult.ai_confidence ?? null,
    aiResult.ai_observations || null,
    riskLevel,
    alertStatus
);

const alert = await createRiskAlert(report);

   return {
    report,
    alert
};
};

const getMyReports = async (userId) => {
    const reports = await reportsModel.getReportsByUserId(userId);

    return reports;
};

module.exports = {
    createReport,
    getMyReports
};