import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_UPLOAD_FOLDER =
  process.env.CLOUDINARY_UPLOAD_FOLDER || "self-actualization";

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary.
 * Expects a local file path (e.g. from multer), returns Cloudinary upload result.
 *
 * @param {string} filePath - Local path to the file
 * @param {Object} options - Additional Cloudinary options
 * @param {string} [options.resourceType='image'] - Cloudinary resource_type ('image', 'video', 'raw', 'auto')
 * @param {string} [options.folder] - Optional folder override
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  const { resourceType = "image", folder } = options;

  return cloudinary.uploader.upload(filePath, {
    folder: folder || CLOUDINARY_UPLOAD_FOLDER,
    resource_type: resourceType,
  });
};

/**
 * Convenience helper for image uploads (thumbnails, etc.).
 */
export const uploadImageToCloudinary = async (filePath, options = {}) => {
  return uploadToCloudinary(filePath, {
    ...options,
    resourceType: "image",
  });
};

/**
 * Convenience helper for video/audio uploads.
 * Cloudinary uses resource_type 'video' for audio/video media.
 */
export const uploadMediaToCloudinary = async (filePath, options = {}) => {
  return uploadToCloudinary(filePath, {
    ...options,
    resourceType: "video",
  });
};


