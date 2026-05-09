import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", authorize("buyer"), createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", authorize("buyer"), updateOrderStatus);

export default router;
