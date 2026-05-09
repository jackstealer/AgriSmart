
import express from "express"
import {
  createCrop,
  getCrops,
  getCropById,
  updateCrop,
  deleteCrop,
} from "../controllers/cropController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);


router.post("/", authorize("farmer"), createCrop);

router.get("/", getCrops);



router.get("/:id", getCropById);



router.put("/:id", authorize("farmer"), updateCrop);


router.delete("/:id", authorize("farmer"), deleteCrop);


export default router;
