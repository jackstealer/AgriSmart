import express from "express";
import { askChatbot } from "../controllers/chatbotController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/ask", askChatbot);

export default router;
