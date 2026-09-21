const OPEN_METEO_URL =
    "https://api.open-meteo.com/v1/forecast";

const fetchRainfall = async ({
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
        "precipitation"
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
            `Open-Meteo request failed: ${response.status} ${errorText}`
        );
    }

    const data =
        await response.json();

    if (
        !data.hourly ||
        !data.hourly.time ||
        !data.hourly.precipitation
    ) {
        throw new Error(
            "Invalid rainfall data received from Open-Meteo"
        );
    }

    const rainfall = data.hourly.time.map(
        (time, index) => ({
            observationTime: time,
            rainfallMm:
                data.hourly.precipitation[index] ?? 0
        })
    );

    return {
        latitude: data.latitude,
        longitude: data.longitude,
        elevation: data.elevation,
        rainfall
    };
};

module.exports = {
    fetchRainfall
};
