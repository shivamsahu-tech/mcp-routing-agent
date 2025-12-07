export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  weatherApiKey: process.env.WEATHER_API_KEY || "",
  openWeatherUrl: "https://api.openweathermap.org/data/2.5/weather",
  geminiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
};