import multer from "multer";

// Store uploaded files in memory so we can stream buffers directly to Cloudinary.
const storage = multer.memoryStorage();

// Accept only image uploads for profile photos.
const fileFilter = (_req, file, cb) => {
  if (file?.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image files are allowed for profileImage"), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for profile images.
  fileFilter,
});

export default upload;
