function calculateRiskLevel(severity, aiConfidence) {
    const confidence = Number(aiConfidence || 0);

    if (severity === "high" && confidence >= 0.70) {
        return "critical";
    }

    if (severity === "high" && confidence >= 0.30) {
        return "high";
    }

    if (confidence >= 0.70) {
        return "high";
    }

    if (confidence >= 0.30) {
        return "medium";
    }

    return "low";
}


function determineAlertStatus(riskLevel) {
    if (riskLevel === "high" || riskLevel === "critical") {
        return "pending";
    }

    if (riskLevel === "medium") {
        return "pending";
    }

    return "not_sent";
}

module.exports = {
    determineAlertStatus
};

module.exports = {
    calculateRiskLevel
};