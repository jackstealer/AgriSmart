import { PricePrediction } from "../models/Price.models.js";
import axios from "axios";

const ML_SERVER_URL = process.env.ML_SERVER_URL || "http://localhost:5001";
const STREAM_INTERVAL_MS = 30000; // 30 seconds

const mandiDataset = [
  { cropName: "Wheat", basePrice: 2275, location: [77.209, 28.6139], state: "Punjab" },
  { cropName: "Rice", basePrice: 2183, location: [77.209, 28.6139], state: "Punjab" },
  { cropName: "Maize", basePrice: 2225, location: [72.8777, 19.076], state: "Maharashtra" },
  { cropName: "Potato", basePrice: 800, location: [80.9462, 26.8467], state: "UP" },
  { cropName: "Tomato", basePrice: 1200, location: [78.4867, 17.385], state: "Karnataka" },
  { cropName: "Onion", basePrice: 1500, location: [73.8567, 18.5204], state: "Maharashtra" },
  { cropName: "Soybean", basePrice: 4600, location: [75.8577, 22.7196], state: "Madhya Pradesh" },
  { cropName: "Cotton", basePrice: 6620, location: [72.5714, 23.0225], state: "Gujarat" },
  { cropName: "Chilli", basePrice: 8000, location: [78.4867, 17.385], state: "Andhra Pradesh" },
];

let timerRef = null;
let cursor = 0;

const fetchMLPrediction = async (crop, state, weatherData = null) => {
  try {
    const response = await axios.post(`${ML_SERVER_URL}/predict-price`, {
      crop: crop,
      state: state,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      rainfall_mm: weatherData?.rainfall || 100,
      temperature_c: weatherData?.temperature || 30,
      demand_index: 1.0 + (Math.random() * 0.2 - 0.1),
      inflation_rate: 5.5
    }, {
      timeout: 5000
    });
    
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error(`ML prediction failed for ${crop}:`, error.message);
  }
  return null;
};

const generateForecast = async (row) => {
  // Try ML model first
  const mlPrediction = await fetchMLPrediction(row.cropName, row.state);
  
  if (mlPrediction) {
    return {
      predictedPrice: mlPrediction.predicted_price,
      confidence: mlPrediction.confidence,
      trend: mlPrediction.trend,
      insights: mlPrediction.insights,
      source: "ml_model",
      historicalPrices: [
        { date: new Date(Date.now() - 86400000 * 2), price: row.basePrice - 30 },
        { date: new Date(Date.now() - 86400000), price: row.basePrice - 10 },
        { date: new Date(), price: row.basePrice },
      ],
    };
  }
  
  // Fallback to algorithmic prediction
  const month = new Date().getMonth() + 1;
  const seasonalFactors = {
    1: 1.02, 2: 1.05, 3: 1.08, 4: 1.05, 5: 0.95, 6: 0.88,
    7: 0.85, 8: 0.90, 9: 0.95, 10: 0.98, 11: 1.00, 12: 1.03
  };
  
  const seasonalFactor = seasonalFactors[month] || 1.0;
  const inflationFactor = 1 + (new Date().getFullYear() - 2020) * 0.055;
  const noise = 1 + (Math.random() - 0.5) * 0.06;
  
  const predictedPrice = Math.round(row.basePrice * seasonalFactor * inflationFactor * noise);
  const trend = predictedPrice > row.basePrice * 1.02 ? "increase" : 
                predictedPrice < row.basePrice * 0.98 ? "decrease" : "stable";
  
  return {
    predictedPrice,
    confidence: 0.65,
    trend,
    insights: `${row.cropName} showing ${trend} trend based on seasonal patterns.`,
    source: "algorithmic",
    historicalPrices: [
      { date: new Date(Date.now() - 86400000 * 2), price: row.basePrice - 30 },
      { date: new Date(Date.now() - 86400000), price: row.basePrice - 10 },
      { date: new Date(), price: row.basePrice },
    ],
  };
};

export const pushNextPricePoint = async () => {
  const row = mandiDataset[cursor % mandiDataset.length];
  cursor += 1;
  
  const forecast = await generateForecast(row);

  const record = await PricePrediction.create({
    cropName: row.cropName,
    location: {
      type: "Point",
      coordinates: row.location,
    },
    state: row.state,
    date: new Date(),
    predictedPrice: forecast.predictedPrice,
    unit: "quintal",
    confidance: forecast.confidence,
    trend: forecast.trend,
    insights: forecast.insights,
    source: forecast.source,
    historicalPrices: forecast.historicalPrices,
  });

  console.log(`[PriceStream] ${row.cropName}: ₹${forecast.predictedPrice}/q (${forecast.trend}) [${forecast.source}]`);
  return record;
};

export const startPriceStream = () => {
  if (timerRef) return;
  
  console.log("🚀 Starting ML-powered price stream...");
  timerRef = setInterval(async () => {
    try {
      await pushNextPricePoint();
    } catch (error) {
      console.error("Price stream tick failed:", error.message);
    }
  }, STREAM_INTERVAL_MS);
};

export const stopPriceStream = () => {
  if (!timerRef) return;
  clearInterval(timerRef);
  timerRef = null;
  console.log("⏹️ Price stream stopped");
};