import { User } from "../models/User.models.js";
import jwt from "jsonwebtoken";
import uploadPromise from "../utils/cloudnary.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields before touching DB/Cloudinary.
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, password and role are required",
      });
    }

    if (!["farmer", "buyer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Profile image is optional — we generate a default avatar if none provided

    let profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff&size=200`;

    // Upload file to Cloudinary if configured and file provided
    if (req.file) {
      const cloudConfigured = process.env.CLOUD_NAME && !process.env.CLOUD_NAME.startsWith('your_');
      if (cloudConfigured) {
        try {
          const uploadResult = await uploadPromise(req.file.buffer, "agrismart/profiles");
          profileImageUrl = uploadResult.secure_url;
        } catch (cloudErr) {
          console.warn("Cloudinary upload failed, using default avatar:", cloudErr.message);
          // keep the default avatar URL
        }
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      profileImage: profileImageUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password. Re-Try" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
