import { Crop } from "../models/Crop.models.js";


export const createCrop = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can create crops",
      });
    }

    const {
      cropName,
      variety,
      quantity,
      unit,
      pricePerUnit,
      quality,
      harvestDate,
      location,
      images,
    } = req.body;

    if (!cropName || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const crop = new Crop({
      cropName,
      variety,
      quantity,
      unit,
      pricePerUnit,
      quality,
      harvestDate,
      images,
      farmerId: req.user.id,
      location:
        location?.lat && location?.lng
          ? {
              type: "Point",
              coordinates: [location.lng, location.lat],
            }
          : undefined,
    });

    await crop.save();

    res.status(201).json({
      success: true,
      data: crop,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCrops = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let query = {};

    if (req.user.role === "farmer") {
      query.farmerId = req.user.id;
    } else {
      query.status = "available";
    }


    if (search) {
      query.cropName = { $regex: search, $options: "i" };
    }

    const crops = await Crop.find(query)
      .populate("farmerId", "name location")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Crop.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      data: crops,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching crops",
    });
  }
};

export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate("farmerId", "name location");

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    res.json({
      success: true,
      data: crop,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }
    if (crop.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    Object.assign(crop, req.body);

    await crop.save();

    res.json({
      success: true,
      data: crop,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // 🔐 Ownership check
    if (crop.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await crop.deleteOne();

    res.json({
      success: true,
      message: "Crop deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
