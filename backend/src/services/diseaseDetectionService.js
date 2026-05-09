import axios from "axios";

const ML_SERVER_URL = process.env.ML_SERVER_URL || "http://localhost:5001";

export const detectDiseaseFromImage = async ({ imageUrl, cropName }) => {
  try {
    let imageBuffer;
    let contentType = "image/jpeg";

    if (imageUrl.startsWith("data:")) {
      // Extract base64 data
      const [header, base64Data] = imageUrl.split(",");
      contentType = header.match(/data:(.*);base64/)?.[1] || "image/jpeg";
      imageBuffer = Buffer.from(base64Data, "base64");
    } else {
      // Download from URL
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
      });
      imageBuffer = Buffer.from(response.data);
      contentType = response.headers["content-type"] || "image/jpeg";
    }

    // Send image directly as binary to Flask with crop type
    const { data } = await axios.post(
      `${ML_SERVER_URL}/predict-binary`,
      imageBuffer,
      {
        headers: { 
          "Content-Type": contentType,
          "X-Crop-Type": cropName || "unknown"  // Pass crop name in header
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (!data.success) throw new Error(data.error || "Prediction failed");

    return {
  diseaseName: data.diseaseName?.replace(/_/g, " ").replace(/---/g, " - "),
  affectedCrop: data.affectedCrop?.replace(/_/g, " "),
  confidence: data.confidence / 100,  // ← fix: frontend multiplies by 100 again
  isHealthy: data.isHealthy,
  severity: data.severity,
  description: data.description,
  suggestions: data.suggestions,
  prevention: data.prevention,
  top3Predictions: data.top3Predictions,
  source: data.source,
};
  } catch (error) {
    console.error("Disease detection error:", error.message);
    return {
      diseaseName: "Detection unavailable",
      confidence: 0,
      severity: "Unknown",
      description: "Could not analyze image. Please try again.",
      suggestions: ["Ensure ML server is running", "Try again with a clearer image"],
      prevention: [],
      isHealthy: null,
      source: "fallback",
    };
  }
};