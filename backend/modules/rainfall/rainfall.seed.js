const pool = require("../../config/db");

const locations = [
    {
        latitude: 26.1445,
        longitude: 91.7362,
        district: "Kamrup Metropolitan",
        state: "Assam",
        baseRainfall: 1.8
    },
    {
        latitude: 26.2006,
        longitude: 92.9376,
        district: "Nagaon",
        state: "Assam",
        baseRainfall: 2.8
    },
    {
        latitude: 25.5788,
        longitude: 91.8933,
        district: "East Khasi Hills",
        state: "Meghalaya",
        baseRainfall: 3.6
    },
    {
        latitude: 25.4670,
        longitude: 90.2000,
        district: "West Garo Hills",
        state: "Meghalaya",
        baseRainfall: 4.7
    },
    {
        latitude: 27.0844,
        longitude: 93.6053,
        district: "Papum Pare",
        state: "Arunachal Pradesh",
        baseRainfall: 4.0
    },
    {
        latitude: 27.5706,
        longitude: 93.8283,
        district: "Lower Subansiri",
        state: "Arunachal Pradesh",
        baseRainfall: 3.1
    },
    {
        latitude: 25.6751,
        longitude: 94.1086,
        district: "Kohima",
        state: "Nagaland",
        baseRainfall: 2.6
    },
    {
        latitude: 24.8170,
        longitude: 93.9368,
        district: "Imphal West",
        state: "Manipur",
        baseRainfall: 2.0
    },
    {
        latitude: 23.7271,
        longitude: 92.7176,
        district: "Aizawl",
        state: "Mizoram",
        baseRainfall: 3.8
    },
    {
        latitude: 23.8315,
        longitude: 91.2868,
        district: "West Tripura",
        state: "Tripura",
        baseRainfall: 1.5
    },
    {
        latitude: 27.3389,
        longitude: 88.6065,
        district: "East Sikkim",
        state: "Sikkim",
        baseRainfall: 3.3
    }
];

const HOURS_PER_LOCATION = 24;

const generateRainfall = (baseRainfall, hour) => {
    // Create a few heavier rainfall periods
    if (hour >= 18 && hour <= 21) {
        return Number((baseRainfall * 2.5).toFixed(2));
    }

    if (hour >= 12 && hour <= 14) {
        return Number((baseRainfall * 1.5).toFixed(2));
    }

    return Number(
        (baseRainfall * (0.7 + Math.random() * 0.6)).toFixed(2)
    );
};


const seedRainfall = async () => {

    try {

        console.log("Starting rainfall seed...");

        const expectedRecords =
            locations.length * HOURS_PER_LOCATION;


        const countQuery = `
            SELECT COUNT(*) AS count
            FROM rainfall_readings
            WHERE source = 'DEMO'
        `;

        const { rows } = await pool.query(countQuery);

        const existingCount = Number(rows[0].count);


        if (existingCount === expectedRecords) {

            console.log(
                "Rainfall demo data already exists. Skipping seed."
            );

            return;
        }


        // Remove old/incomplete demo data.
        if (existingCount > 0) {

            console.log(
                "Removing old demo rainfall data..."
            );

            await pool.query(`
                DELETE FROM rainfall_readings
                WHERE source = 'DEMO'
            `);
        }


        console.log(
            `Generating ${expectedRecords} rainfall observations...`
        );


        const now = new Date();


        for (const location of locations) {

            for (let hour = HOURS_PER_LOCATION - 1; hour >= 0; hour--) {

                const observationTime = new Date(
                    now.getTime() - hour * 60 * 60 * 1000
                );


                const rainfallMm = generateRainfall(
                    location.baseRainfall,
                    hour
                );


                const query = `
                    INSERT INTO rainfall_readings (
                        latitude,
                        longitude,
                        rainfall_mm,
                        observation_time,
                        district,
                        state,
                        source
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `;


                const values = [
                    location.latitude,
                    location.longitude,
                    rainfallMm,
                    observationTime,
                    location.district,
                    location.state,
                    "DEMO"
                ];


                await pool.query(query, values);
            }


            console.log(
                `Inserted 24 hours for ${location.district}, ${location.state}`
            );
        }


        console.log(
            "Rainfall seed completed successfully."
        );

    } catch (error) {

        console.error(
            "Rainfall seed failed:",
            error
        );

        throw error;
    }
};


module.exports = seedRainfall;