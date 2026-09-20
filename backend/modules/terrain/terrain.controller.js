const {
    fetchAndSaveTerrain,
    getTerrainData
} = require("./terrain.service");


const getTerrain = async (req, res) => {

    const {
        latitude,
        longitude
    } = req.params;


    const terrain =
        await fetchAndSaveTerrain(
            Number(latitude),
            Number(longitude)
        );


    res.status(200).json({
        success: true,
        data: terrain
    });
};


const getStoredTerrain = async (
    req,
    res
) => {

    const {
        latitude,
        longitude
    } = req.params;


    const terrain =
        await getTerrainData(
            Number(latitude),
            Number(longitude)
        );


    if (!terrain) {

        return res.status(404).json({
            success: false,
            message:
                "Terrain data not found"
        });
    }


    res.status(200).json({
        success: true,
        data: terrain
    });
};


module.exports = {
    getTerrain,
    getStoredTerrain
};