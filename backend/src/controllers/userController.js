import { User } from "../models/User.models.js";
import { Crop } from "../models/Crop.models.js";
import { Order } from "../models/Order.models.js";
import { Shipment } from "../models/Shipment.models.js";
import uploadPromise from "../utils/cloudnary.js";

// Simple login history placeholder to satisfy frontend route
export const getLoginHistory = async (_req, res) => {
  res.json([]);
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

export const updateMe = async (req, res) => {
  try {
    // Password change flow
    if (req.body.currentPassword || req.body.newPassword) {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Current and new password are required" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ success: false, message: "Password must be at least 6 characters" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      user.password = newPassword;
      await user.save();

      return res.json({ success: true, message: "Password updated successfully" });
    }

    const allowedFields = ["name", "phone", "preferences", "farmDetails"];
    const updatePayload = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updatePayload[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updatePayload, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete related data
    const userCrops = await Crop.find({ farmerId: userId }).select("_id");
    const userCropIds = userCrops.map((c) => c._id);

    await Promise.all([
      Crop.deleteMany({ farmerId: userId }),
      Order.deleteMany({
        $or: [{ buyerId: userId }, { cropId: { $in: userCropIds } }],
      }),
      Shipment.deleteMany({
        $or: [{ buyerId: userId }, { farmerId: userId }, { cropId: { $in: userCropIds } }],
      }),
    ]);

    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    
    const result = await uploadPromise;
    const imageUrl = result.secure_url;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      data: user,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
