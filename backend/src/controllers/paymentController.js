import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/Order.models.js";

// Lazy initialization to ensure env vars are loaded
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const razorpayOrder = await getRazorpay().orders.create({
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${orderId}`,
      notes: { orderId: orderId.toString() },
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Mark order as paid (use the schema field `status`)
    await Order.findByIdAndUpdate(orderId, {
      status: 'paid',
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paidAt: new Date(),
    });

    res.json({ message: 'Payment verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── 3. REFUND (Buyer requests refund) ───────────────────────────────────────
export const refundPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.status !== 'paid') {
      return res.status(400).json({ message: 'No paid payment found for this order' });
    }

    const refund = await getRazorpay().payments.refund(order.paymentId, {
      amount: order.totalAmount * 100, // full refund; partial: pass custom amount
    });

    await Order.findByIdAndUpdate(orderId, {
      status: 'refunded',
      refundId: refund.id,
    });

    res.json({ message: 'Refund initiated', refundId: refund.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── 4. PAYOUT TO FARMER ─────────────────────────────────────────────────────
export const payoutToFarmer = async (req, res) => {
  try {
    const { farmerId, amount, accountNumber, ifscCode, farmerName } = req.body;

    const razorpayInstance = getRazorpay();

    // Step 1 — create contact
    const contact = await razorpayInstance.contacts.create({
      name: farmerName,
      type: 'vendor',
      reference_id: farmerId,
    });

    // Step 2 — create fund account
    const fundAccount = await razorpayInstance.fundAccount.create({
      contact_id: contact.id,
      account_type: 'bank_account',
      bank_account: {
        name: farmerName,
        ifsc: ifscCode,
        account_number: accountNumber,
      },
    });

    // Step 3 — create payout
    const payout = await razorpayInstance.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // your Razorpay X account
      fund_account_id: fundAccount.id,
      amount: amount * 100,
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'vendor_advance',
      queue_if_low_balance: true,
    });

    res.json({ message: 'Payout initiated', payoutId: payout.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
