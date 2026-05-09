import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type:String,
        enum:["price_drop",
            "shipment_delay",
            "weather_risk",
            "disease",
            "temperature_alert"
        ]
    },
    severity:{
        type: String,
        enum:["info", "warning", "critical"],
        default: "info"
    },
    message: String,

    relatedId: mongoose.Schema.Types.ObjectId,

    read:{
        type: Boolean,
        default: false,
        index: true
    }
}, {timestamps: true})

export const Alert = mongoose.model('Alert', alertSchema)