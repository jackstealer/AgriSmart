import express from 'express'
import { authorize, protect } from '../middlewares/authMiddleware.js';
import { createPaymentOrder, payoutToFarmer, refundPayment, verifyPayment } from '../controllers/paymentController.js';


const router = express.Router();
router.post('/create-order', protect, authorize('buyer'), createPaymentOrder)
router.post('/verify', protect, authorize('buyer'), verifyPayment)
router.post('/refund', protect, authorize('buyer'), refundPayment)
router.post('/payout', protect, authorize('farmer'), payoutToFarmer)
export default router