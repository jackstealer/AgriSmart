import express from "express";
import { detectCropDisease, getMyDiseaseDetections } from "../controllers/diseaseController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.post("/detect", authorize("farmer"), upload.single("image"), detectCropDisease);
router.get("/my", authorize("farmer"), getMyDiseaseDetections);

export default router;