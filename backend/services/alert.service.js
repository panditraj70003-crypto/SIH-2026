function determineAlertStatus(riskLevel) {
    if (
        riskLevel === "high" ||
        riskLevel === "critical" ||
        riskLevel === "medium"
    ) {
        return "pending";
    }

    return "not_sent";
}

module.exports = {
    determineAlertStatus
};