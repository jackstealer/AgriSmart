import { Crop } from "../models/Crop.models.js";
import { CropHealth } from "../models/CropHealth.models.js";
import { detectDiseaseFromImage } from "../services/diseaseDetectionService.js";
import { v2 as cloudinary } from "cloudinary";

export const detectCropDisease = async (req, res) => {
  try {
    const { cropId } = req.body;

    if (!cropId) {
      return res.status(400).json({ success: false, message: "cropId is required" });
    }

    // Get imageUrl — either from body (URL) or from uploaded file
    let imageUrl = req.body.imageUrl;

    if (!imageUrl && req.file) {
      // File was uploaded — upload to Cloudinary first
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "agrismart/disease", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, message: "Crop not found" });
    }
    if (crop.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized for this crop" });
    }

    // Call ML server with the Cloudinary URL and crop name
    const result = await detectDiseaseFromImage({ 
      imageUrl,
      cropName: crop.cropName 
    });

    const record = await CropHealth.create({
      farmerId: req.user.id,
      cropId,
      imageUrl,
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      suggestions: result.suggestions,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        ...record._doc,
        affectedCrop: result.affectedCrop,
        severity: result.severity,
        description: result.description,
        prevention: result.prevention,
        top3Predictions: result.top3Predictions,
        isHealthy: result.isHealthy,
        source: result.source,
      },
    });
  } catch (err) {
    console.error("Disease controller error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyDiseaseDetections = async (req, res) => {
  try {
    const records = await CropHealth.find({ farmerId: req.user.id })
      .populate("cropId", "cropName variety")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};