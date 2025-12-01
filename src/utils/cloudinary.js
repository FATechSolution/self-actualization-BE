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
 * Accepts either a local file path (for local dev) or a buffer (for serverless/Vercel).
 *
 * @param {string|Buffer} filePathOrBuffer - Local path to the file or a Buffer
 * @param {Object} options - Additional Cloudinary options
 * @param {string} [options.resourceType='image'] - Cloudinary resource_type ('image', 'video', 'raw', 'auto')
 * @param {string} [options.folder] - Optional folder override
 * @param {string} [options.filename] - Optional filename for buffer uploads
 */
export const uploadToCloudinary = async (filePathOrBuffer, options = {}) => {
  const { resourceType = "image", folder, filename } = options;

  // If it's a Buffer (from memory storage), use upload_stream
  if (Buffer.isBuffer(filePathOrBuffer)) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder || CLOUDINARY_UPLOAD_FOLDER,
        resource_type: resourceType,
      };
      
      if (filename) {
        uploadOptions.public_id = filename;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(filePathOrBuffer);
    });
  }

  // Otherwise, treat it as a file path (for local development)
  return cloudinary.uploader.upload(filePathOrBuffer, {
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


