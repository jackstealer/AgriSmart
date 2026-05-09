import mongoose from "mongoose";

const pricePredictionSchema = new mongoose.Schema({
    cropName:{
        type: String,
        index: true
    },
    location: {
        type:{
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: [Number]
    },
    date: Date,

    predictedPrice: Number,
    unit:{
        type: String,
        default: "Kg"
    },
    confidance:{
        type: Number,
        min: 0,
        max: 1
    },

    trend: {
        type: String,
        enum:["increase", "decrease", "stable"]
    },
    insights :String,
    historicalPrices:[{
        date: Date,
        price : Number
    }]
}, {timestamps: true})

export const PricePrediction = mongoose.model("PricePrediction", pricePredictionSchema);
