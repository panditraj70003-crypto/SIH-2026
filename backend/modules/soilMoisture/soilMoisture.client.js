const OPEN_METEO_URL =
    "https://api.open-meteo.com/v1/forecast";

const fetchSoilMoisture = async ({
    latitude,
    longitude,
    pastHours = 24
}) => {

    if (
        latitude === undefined ||
        longitude === undefined
    ) {
        throw new Error(
            "Latitude and longitude are required"
        );
    }

    const url = new URL(OPEN_METEO_URL);

    url.searchParams.set(
        "latitude",
        latitude
    );

    url.searchParams.set(
        "longitude",
        longitude
    );

    url.searchParams.set(
        "hourly",
        [
            "soil_moisture_0_to_1cm",
            "soil_moisture_1_to_3cm",
            "soil_moisture_3_to_9cm",
            "soil_moisture_9_to_27cm",
            "soil_moisture_27_to_81cm"
        ].join(",")
    );

    url.searchParams.set(
        "past_hours",
        pastHours
    );

    url.searchParams.set(
        "forecast_hours",
        "1"
    );

    url.searchParams.set(
        "timezone",
        "UTC"
    );

    const response = await fetch(
        url.toString()
    );

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Open-Meteo soil moisture request failed: ${response.status} ${errorText}`
        );
    }

    const data =
        await response.json();

    if (
        !data.hourly ||
        !data.hourly.time
    ) {
        throw new Error(
            "Invalid soil moisture data received from Open-Meteo"
        );
    }

    const soilMoisture = data.hourly.time.map(
        (time, index) => ({
            observationTime: time,

            moisture_0_1cm:
                data.hourly
                    .soil_moisture_0_to_1cm?.[index] ?? null,

            moisture_1_3cm:
                data.hourly
                    .soil_moisture_1_to_3cm?.[index] ?? null,

            moisture_3_9cm:
                data.hourly
                    .soil_moisture_3_to_9cm?.[index] ?? null,

            moisture_9_27cm:
                data.hourly
                    .soil_moisture_9_to_27cm?.[index] ?? null,

            moisture_27_81cm:
                data.hourly
                    .soil_moisture_27_to_81cm?.[index] ?? null
        })
    );

    return {
        latitude: data.latitude,
        longitude: data.longitude,
        elevation: data.elevation,
        soilMoisture
    };
};

module.exports = {
    fetchSoilMoisture
};