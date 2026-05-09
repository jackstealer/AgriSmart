import express from "express";
import multer from "multer";
import { login, signup } from "../controllers/authController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);

// Handle multer-specific errors for auth routes so invalid files return 4xx instead of 500.
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err?.message === "Only image files are allowed for profileImage") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return next(err);
});

export default router;
