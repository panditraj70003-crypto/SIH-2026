const pool = require("../../config/db");

const historicalLandslides = [
    // Meghalaya
    {
        latitude: 25.5795,
        longitude: 91.8950,
        eventDate: "2025-07-15",
        district: "East Khasi Hills",
        state: "Meghalaya",
        severity: "high"
    },
    {
        latitude: 25.5900,
        longitude: 91.8800,
        eventDate: "2024-06-28",
        district: "East Khasi Hills",
        state: "Meghalaya",
        severity: "medium"
    },
    {
        latitude: 25.4700,
        longitude: 90.2100,
        eventDate: "2023-08-12",
        district: "West Garo Hills",
        state: "Meghalaya",
        severity: "high"
    },

    // Assam
    {
        latitude: 26.1450,
        longitude: 91.7380,
        eventDate: "2025-06-20",
        district: "Kamrup Metropolitan",
        state: "Assam",
        severity: "medium"
    },
    {
        latitude: 26.2050,
        longitude: 92.9400,
        eventDate: "2024-07-18",
        district: "Nagaon",
        state: "Assam",
        severity: "high"
    },

    // Arunachal Pradesh
    {
        latitude: 27.0860,
        longitude: 93.6070,
        eventDate: "2025-08-04",
        district: "Papum Pare",
        state: "Arunachal Pradesh",
        severity: "high"
    },
    {
        latitude: 27.5750,
        longitude: 93.8300,
        eventDate: "2024-07-10",
        district: "Lower Subansiri",
        state: "Arunachal Pradesh",
        severity: "medium"
    },

    // Nagaland
    {
        latitude: 25.6770,
        longitude: 94.1100,
        eventDate: "2023-07-22",
        district: "Kohima",
        state: "Nagaland",
        severity: "high"
    },

    // Manipur
    {
        latitude: 24.8190,
        longitude: 93.9390,
        eventDate: "2025-06-30",
        district: "Imphal West",
        state: "Manipur",
        severity: "medium"
    },

    // Mizoram
    {
        latitude: 23.7290,
        longitude: 92.7190,
        eventDate: "2024-08-16",
        district: "Aizawl",
        state: "Mizoram",
        severity: "high"
    },

    // Tripura
    {
        latitude: 23.8330,
        longitude: 91.2890,
        eventDate: "2023-06-25",
        district: "West Tripura",
        state: "Tripura",
        severity: "medium"
    },

    // Sikkim
    {
        latitude: 27.3410,
        longitude: 88.6090,
        eventDate: "2025-07-05",
        district: "East Sikkim",
        state: "Sikkim",
        severity: "high"
    }
];


const seedHistoricalLandslides = async () => {

    try {

        console.log(
            "Starting historical landslide seed..."
        );


        const countQuery = `
            SELECT COUNT(*) AS count
            FROM historical_landslides
            WHERE source = 'DEMO'
        `;


        const { rows } = await pool.query(
            countQuery
        );


        const existingCount =
            Number(rows[0].count);


        if (
            existingCount ===
            historicalLandslides.length
        ) {

            console.log(
                "Historical landslide demo data already exists. Skipping seed."
            );

            return;
        }


        if (existingCount > 0) {

            console.log(
                "Removing old historical landslide demo data..."
            );


            await pool.query(`
                DELETE FROM historical_landslides
                WHERE source = 'DEMO'
            `);
        }


        for (
            const event
            of historicalLandslides
        ) {

            const query = `
                INSERT INTO historical_landslides (
                    latitude,
                    longitude,
                    event_date,
                    district,
                    state,
                    severity,
                    source,
                    description
                )
                VALUES (
                    $1, $2, $3, $4,
                    $5, $6, $7, $8
                )
            `;


            const values = [
                event.latitude,
                event.longitude,
                event.eventDate,
                event.district,
                event.state,
                event.severity,
                "DEMO",
                "Demo historical landslide event"
            ];


            await pool.query(
                query,
                values
            );


            console.log(
                `Inserted historical landslide for ${event.district}, ${event.state}`
            );
        }


        console.log(
            "Historical landslide seed completed successfully."
        );

    } catch (error) {

        console.error(
            "Historical landslide seed failed:",
            error
        );

        throw error;
    }
};


module.exports =
    seedHistoricalLandslides;