import { z } from "zod";

export const weatherTool = {
    name: "get_weather",
    description: "Get current weather for a location.",
    inputSchema: {
        type: "object",
        properties: {
            location: { type: "string", description: "City name" },
        },
        required: ["location"],
    },
};

const weatherCodes: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Heavy thunderstorm"
};

export async function executeWeatherTool(args: any) {
    const { location } = z.object({ location: z.string() }).parse(args);

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData: any = await geoRes.json();

        if (!geoData.results?.[0]) {
            return { content: [{ type: "text", text: `Location '${location}' not found.` }] };
        }

        const { latitude, longitude, name } = geoData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData: any = await weatherRes.json();

        const current = weatherData.current;
        const condition = weatherCodes[current.weather_code] || "Unknown";

        return {
            content: [{
                type: "text",
                text: `Weather in ${name}: ${condition}, ${current.temperature_2m}°C, Wind: ${current.wind_speed_10m} km/h`
            }]
        };
    } catch (error) {
        return { content: [{ type: "text", text: "Error fetching weather data." }] };
    }
}
