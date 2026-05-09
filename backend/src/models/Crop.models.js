import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
    
    farmerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    cropName: {
        type: String,
        required: true,
        index: true
    },

    variety: String,

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    unit: {
        type: String,
        enum: ['kg', 'ton', 'quintal'],
        default: 'kg'
    },

    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },

    quality: {
        type: String,
        enum: ['Organic', 'Grade A', 'Grade B', 'Standard'],
        default: 'Standard'
    },

    harvestDate: Date,

    
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], 
            index: '2dsphere'
        }
    },

    images: [String],

    status: {
        type: String,
        enum: ['available', 'sold', 'expired'],
        default: 'available',
        index: true
    },


    aiInsights: {
        predictedPrice: Number,
        priceTrend: {
            type: String,
            enum: ['up', 'down', 'stable']
        },
        demandScore: Number,
        recommendedSellDate: Date,
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high']
        }
    },


    availableQuantity: {
        type: Number
    },

    isNegotiable: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});


cropSchema.pre('save', function(){
    if (!this.availableQuantity) {
        this.availableQuantity = this.quantity;
    }
});

export const Crop = mongoose.model("Crop", cropSchema);