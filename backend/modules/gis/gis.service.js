const gisModel = require("./gis.model");

const getRiskLocations = async (riskLevel = null) => {
    const locations = await gisModel.getRiskLocations(riskLevel);

    return locations;
};

const getRiskSummary = async () => {
    const summary = await gisModel.getRiskSummary();

    return summary;
};

module.exports = {
    getRiskLocations,
    getRiskSummary
};