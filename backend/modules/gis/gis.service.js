const gisModel = require("./gis.model");

const getRiskLocations = async (riskLevel = null) => {
    const locations = await gisModel.getRiskLocations(riskLevel);

    return locations;
};

const getRiskSummary = async () => {
    const summary = await gisModel.getRiskSummary();

    return summary;
};

const getRiskLocationById = async (id) => {
    const location = await gisModel.getRiskLocationById(id);

    return location;
};

module.exports = {
    getRiskLocations,
    getRiskSummary,
    getRiskLocationById
};