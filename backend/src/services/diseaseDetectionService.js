import axios from "axios";

const ML_SERVER_URL = process.env.ML_SERVER_URL || "http://localhost:5001";

export const detectDiseaseFromImage = async ({ imageUrl, cropName }) => {
  let imageBuffer;
  let contentType = "image/jpeg";

  // ── Step 1: Extract image bytes ─────────────────────────────────────────────
  if (imageUrl.startsWith("data:")) {
    const commaIdx = imageUrl.indexOf(",");
    const header   = imageUrl.substring(0, commaIdx);
    const b64Data  = imageUrl.substring(commaIdx + 1);
    contentType    = header.match(/data:(.*);base64/)?.[1] || "image/jpeg";
    imageBuffer    = Buffer.from(b64Data, "base64");
  } else {
    try {
      const urlObj = new URL(imageUrl);
      const hostname = urlObj.hostname.toLowerCase();

      // Enforce HTTPS
      if (urlObj.protocol !== "https:") {
        throw new Error("Invalid URL protocol. Only HTTPS is allowed.");
      }

      // Block SSRF to internal/private IPs (AWS metadata, localhost, etc.)
      const isPrivate =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        hostname === "169.254.169.254";

      if (isPrivate) {
        throw new Error("Access to local/private networks is forbidden.");
      }
    } catch (err) {
      throw new Error("Invalid or forbidden image URL");
    }

    const dlResp = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    imageBuffer = Buffer.from(dlResp.data);
    contentType = dlResp.headers["content-type"] || "image/jpeg";
  }

  console.log(`[DiseaseService] Image ready: ${imageBuffer.length} bytes, crop: ${cropName}`);
  console.log(`[DiseaseService] Calling ML server at ${ML_SERVER_URL}/predict-binary`);

  // ── Step 2: Call ML server ──────────────────────────────────────────────────
  let mlResp;
  try {
    mlResp = await axios.post(
      `${ML_SERVER_URL}/predict-binary`,
      imageBuffer,
      {
        headers: {
          "Content-Type": contentType,
          "X-Crop-Type": cropName || "unknown",
        },
        timeout: 90000,          // 90 s — Groq vision can take time
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
  } catch (axiosErr) {
    const msg = axiosErr.response?.data?.error || axiosErr.message;
    console.error("[DiseaseService] ML server call failed:", msg);
    throw new Error(`ML server unreachable: ${msg}`);
  }

  const data = mlResp.data;
  console.log("[DiseaseService] ML response:", JSON.stringify(data).slice(0, 300));

  if (!data?.success) {
    throw new Error(data?.error || "ML server returned unsuccessful prediction");
  }

  // ── Step 3: Normalise response ──────────────────────────────────────────────
  // ML server already returns confidence as 0-100 integer (e.g. 90)
  // Frontend multiplies by 100 again → we send as 0-1 fraction
  return {
    diseaseName:      (data.diseaseName || "Unknown").replace(/_/g, " ").replace(/---/g, " - "),
    affectedCrop:     (data.affectedCrop || cropName || "Unknown").replace(/_/g, " "),
    confidence:       (data.confidence ?? 0) / 100,  // convert 0-100 → 0-1
    isHealthy:        Boolean(data.isHealthy),
    severity:         data.severity || "Unknown",
    description:      data.description || "",
    suggestions:      Array.isArray(data.suggestions) ? data.suggestions : [],
    prevention:       Array.isArray(data.prevention)  ? data.prevention  : [],
    top3Predictions:  Array.isArray(data.top3Predictions) ? data.top3Predictions : [],
    source:           data.source || "ml-server",
  };
};