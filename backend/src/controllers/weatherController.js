import { Weather } from "../models/Weather.models.js";
import { deriveWeatherRiskSuggestion, fetchCurrentWeather } from "../services/weatherService.js";
import axios from "axios";

const parseCoordinates = (latRaw, lngRaw) => {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const getCityFromCoords = async (lat, lng) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return "India";
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`
    );
    return response.data?.[0]?.name || "India";
  } catch {
    return "India";
  }
};

export const getCurrentWeather = async (req, res) => {
  try {
    const coords = parseCoordinates(req.query.lat, req.query.lng);
    if (!coords) {
      return res.status(400).json({ success: false, message: "lat and lng query params are required" });
    }

    const current = await fetchCurrentWeather(coords);
    const city = await getCityFromCoords(coords.lat, coords.lng);

    // ← now awaited + city passed
    const ai = await deriveWeatherRiskSuggestion({
      temperature: current.temperature,
      humidity: current.humidity,
      rainfall: current.rainfall,
      windSpeed: current.windSpeed,
      forecastSummary: current.forecastSummary,
      city,
    });

    const weatherDoc = await Weather.create({
      location: {
        type: "Point",
        coordinates: [coords.lng, coords.lat],
      },
      temperature: current.temperature,
      humidity: current.humidity,
      rainfall: current.rainfall,
      windSpeed: current.windSpeed,
      forecastSummary: current.forecastSummary,
      aiSuggestion: ai.aiSuggestion,
      riskLevel: ai.riskLevel,
    });

    res.json({
      success: true,
      source: current.source,
      data: weatherDoc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLatestWeather = async (req, res) => {
  try {
    const latest = await Weather.findOne().sort({ createdAt: -1 });
    if (!latest) {
      return res.status(404).json({ success: false, message: "No weather data found" });
    }
    res.json({ success: true, data: latest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};