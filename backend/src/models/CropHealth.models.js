import mongoose from "mongoose";

const cropHealthSchema = new mongoose.Schema({
    farmerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop"
  },

  imageUrl: String,

  diseaseName: String,

  confidence: Number,

  detectedAt: {
    type: Date,
    default: Date.now
  },

  suggestions: [String],

  status: {
    type: String,
    enum: ["pending", "treated", "resolved"],
    default: "pending"
  }
},{timestamps: true})

export const CropHealth = mongoose.model('CropHealth', cropHealthSchema)