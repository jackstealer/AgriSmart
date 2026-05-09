import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    unique: true,
    index: true
  },
  // keep legacy naming alignment for order link
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  buyerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  sellerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  farmerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  cropName:String,
  quantity:{
      type: Number,
      required: true
  },
  transportationMode: {
      type: String,
      enum: ['self', 'platform'],
      default: 'self'
  },
  status:{
      type: String,
      enum:["pending", "in_transit", "delivered", "created", "picked_up", "delayed", "canceled"],
      default : "pending",
      index: true
  },
  estimatedDelivery: Date,
  currentLocation: { type: String, default: null },
  trackingUpdates: [
    {
      timestamp: { type: Date, default: Date.now },
      status: String,
      location: String
    }
  ],
  // legacy/optional fields retained for compatibility
  cropId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop', 
  },
  agreedPrice: {
      type: Number
  },
  destination:{
      address: String,
      location: {
          type:{
              type: String,
              enum : ["Point"],
              default: "Point"
          },
          coordinates: [Number]
      }
  },
  truckId: String,
  currentLocationGeo:{
      type:{
      type: String,
      enum: ["Point"],
      default: "Point"
  },
  coordinates: {
      type:[Number],
      index:"2dsphere"
  },
},
locationHistory:[
 {
       timestamps: Date,
    coordinates: [Number]
}
],
eta: Date,
  currentTemperature: Number,

  temperatureHistory: [
    {
      timestamp: Date,
      value: Number
    }
  ],


  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },

  aiInsights: {
    routeRiskScore: Number,
    etaConfidence: Number,
    anomalyFlags: [String],
    modelVersion: String,
    lastEvaluatedAt: Date
  },

  integrationRefs: {
    pathwayStreamId: String
  },

  alerts: [
    {
      type: String,
      severity: {
        type: String,
        enum: ["warning", "critical"]
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, {timestamps: true})

shipmentSchema.pre('save', function() {
    if(this.locationHistory.length > 100){
        this.locationHistory.shift()
    }
    if(this.temperatureHistory.length > 100){
        this.temperatureHistory.shift()
    }
})
export const Shipment = mongoose.model('Shipment' , shipmentSchema)
