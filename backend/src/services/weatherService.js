import '../config/env.js';
import axios from "axios";
import Groq from "groq-sdk";

const OPEN_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const toNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildSimulatedWeather = ({ lat, lng }) => {
  const seed = Math.abs(Math.round((lat + lng) * 1000));
  return {
    temperature: 20 + (seed % 12),
    humidity: 45 + (seed % 40),
    rainfall: (seed % 5) * 0.6,
    windSpeed: 2 + (seed % 8),
    forecastSummary: "Simulated clear-to-cloudy conditions",
    source: "simulated",
  };
};

export const fetchCurrentWeather = async ({ lat, lng }) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return buildSimulatedWeather({ lat, lng });

  const response = await axios.get(OPEN_WEATHER_URL, {
    params: { lat, lon: lng, appid: apiKey, units: "metric" },
    timeout: 10000,
  });

  const data = response.data || {};
  return {
    temperature: toNumber(data?.main?.temp, 0),
    humidity: toNumber(data?.main?.humidity, 0),
    rainfall: toNumber(data?.rain?.["1h"], 0),
    windSpeed: toNumber(data?.wind?.speed, 0),
    forecastSummary: data?.weather?.[0]?.description || "No summary",
    source: "openweather",
  };
};

export const deriveWeatherRiskSuggestion = async ({ temperature, humidity, rainfall, windSpeed, forecastSummary, city }) => {
  try {
    const prompt = `Current weather in ${city || "India"}:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Rainfall: ${rainfall}mm
- Wind Speed: ${windSpeed} km/h
- Condition: ${forecastSummary}

Give farming advice for Indian farmers in 4 bullet points covering:
1. Irrigation needs
2. Pest/disease risk
3. Field operations (spraying/harvesting)
4. Any crop-specific warning

Keep each point under 15 words. Be direct and practical.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert agricultural advisor for Indian farmers. Give concise, practical advice." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const advice = response.choices[0].message.content;

    // Determine risk level from weather data
    let riskLevel = "low";
    if (temperature >= 38 || rainfall >= 30 || windSpeed >= 14) riskLevel = "high";
    else if (temperature >= 33 || rainfall >= 15 || windSpeed >= 10) riskLevel = "medium";

    return {
      riskLevel,
      aiSuggestion: advice,
    };
  } catch (error) {
    console.error("Weather AI advice error:", error.message);

    // Fallback to rule-based
    if (temperature >= 38 || rainfall >= 30 || windSpeed >= 14) {
      return { riskLevel: "high", aiSuggestion: "High weather risk. Avoid spraying and secure harvested produce." };
    }
    if (temperature >= 33 || rainfall >= 15 || windSpeed >= 10) {
      return { riskLevel: "medium", aiSuggestion: "Moderate weather risk. Monitor field conditions in shorter intervals." };
    }
    return { riskLevel: "low", aiSuggestion: "Weather conditions are stable for routine farming activities." };
  }
};