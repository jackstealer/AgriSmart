import express from "express";
// import { getMe, updateMe, deleteMe, uploadProfileImage } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import { deleteMe, getMe, getLoginHistory, updateMe, uploadProfileImage } from "../controllers/UserController.js";

const router = express.Router();

router.use(protect);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.delete("/me", deleteMe);
router.get("/login-history", getLoginHistory);

router.patch("/upload-profile", upload.single("profileImage"), uploadProfileImage)
export default router;
