
function calculateRiskLevel(severity, aiConfidence) {
    const confidence = Number(aiConfidence || 0);

    // Critical: high severity + strong AI confidence
    if (severity === "high" && confidence >= 0.70) {
        return "critical";
    }

    // High: high citizen-reported severity
    if (severity === "high") {
        return "high";
    }

    // High: strong AI confidence
    if (confidence >= 0.70) {
        return "high";
    }

    // Medium: moderate AI confidence
    if (confidence >= 0.30) {
        return "medium";
    }

    // Medium: citizen-reported medium severity
    if (severity === "medium") {
        return "medium";
    }

    return "low";
}

module.exports = {
    calculateRiskLevel
};