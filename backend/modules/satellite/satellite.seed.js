const pool = require("../../config/db");

const satelliteLocations = [
    {
        latitude: 25.5788,
        longitude: 91.8933,
        district: "East Khasi Hills",
        state: "Meghalaya"
    },
    {
        latitude: 26.1445,
        longitude: 91.7362,
        district: "Kamrup",
        state: "Assam"
    },
    {
        latitude: 27.4728,
        longitude: 94.9120,
        district: "Dhemaji",
        state: "Assam"
    },
    {
        latitude: 27.3389,
        longitude: 88.6065,
        district: "Gangtok",
        state: "Sikkim"
    },
    {
        latitude: 26.1584,
        longitude: 94.5624,
        district: "Kohima",
        state: "Nagaland"
    },
    {
        latitude: 24.8170,
        longitude: 93.9368,
        district: "Imphal East",
        state: "Manipur"
    },
    {
        latitude: 23.7271,
        longitude: 92.7176,
        district: "Aizawl",
        state: "Mizoram"
    },
    {
        latitude: 23.8315,
        longitude: 91.2868,
        district: "West Tripura",
        state: "Tripura"
    }
];


const seedSatellite = async () => {
    console.log("Starting satellite seed...");

    const expectedCount = satelliteLocations.length;

    const existing = await pool.query(`
        SELECT COUNT(*) AS count
        FROM satellite_observations
        WHERE provider = 'DEMO'
    `);

    const existingCount = Number(existing.rows[0].count);

    if (existingCount === expectedCount) {
        console.log("Satellite demo data already exists.");
        return;
    }

    // Remove old demo observations so the seed remains idempotent.
    await pool.query(`
        DELETE FROM satellite_observations
        WHERE provider = 'DEMO'
    `);

    for (const location of satelliteLocations) {

        const cloudCover = Number(
            (5 + Math.random() * 25).toFixed(2)
        );

        const ndvi = Number(
            (0.35 + Math.random() * 0.45).toFixed(3)
        );

        const observationTime = new Date();

        await pool.query(`
            INSERT INTO satellite_observations (
                latitude,
                longitude,
                observation_time,
                provider,
                asset_id,
                image_url,
                cloud_cover,
                ndvi,
                raw_data
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `, [
            location.latitude,
            location.longitude,
            observationTime,
            "DEMO",
            `DEMO-SAT-${location.state}-${Date.now()}`,
            null,
            cloudCover,
            ndvi,
            JSON.stringify({
                district: location.district,
                state: location.state,
                synthetic: true,
                note: "Synthetic satellite observation for LandSafe development"
            })
        ]);
    }

    console.log(
        `Inserted satellite data for ${expectedCount} locations.`
    );

    console.log("Satellite seed completed successfully.");
};


module.exports = seedSatellite;