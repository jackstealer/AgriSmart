import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema({

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: [Number]
  },

  temperature: Number,
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,

  forecastSummary: String,

  aiSuggestion: String,

  riskLevel: {
    type: String,
    enum: ["low", "medium", "high"]
  }

}, { timestamps: true });

export const Weather = mongoose.model("Weather", weatherSchema);