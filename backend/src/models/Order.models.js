import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    buyerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shipmentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment'
    },
    cropId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    },
    quantity:{
        type: Number,
        required: true
    },
    pricePerUnit: Number,
    totalAmount:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    paymentMethod: String,
    cancelledReason: String,
     paymentId: {
        type: String        // razorpay_payment_id after successful payment
    },
    razorpayOrderId: {
        type: String        // Razorpay order_id created on backend
    },
    refundId: {
        type: String        // Razorpay refund_id after refund is initiated
    },
    paidAt: {
        type: Date
    },
    transportationMode: {
        type: String,
        enum: ['self', 'platform'],
        default: 'self'
    },
    transportFee: {
        type: Number,
        default: 0
    },
    // alias fields for transport as requested
    transport_type: {
        type: String,
        enum: ['self', 'platform'],
        default: 'self'
    },
    delivery_charge: {
        type: Number,
        default: 0
    },
    shippingAddress: {
        type: String,
        default: ""
    },
    shipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment',
        default: null
    }
}, {timestamps: true})

export const Order = mongoose.model("Order", orderSchema);
