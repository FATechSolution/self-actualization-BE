import express from "express";
import multer from "multer";
import {
  listVideos,
  createVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../../controllers/admin/videoAdminController.js";
import { authenticateAdmin } from "../../middlewares/admin/adminAuth.js";

const router = express.Router();

// Simple disk storage for temporary files before Cloudinary upload
const upload = multer({
  dest: "tmp/uploads",
});

// All video management routes require admin authentication
router.use(authenticateAdmin);

// Expect multipart/form-data with optional files:
// - video: video file to upload to Cloudinary (videoUrl will be derived)
// - thumbnail: image file for thumbnail (thumbnailUrl will be derived)
const videoAndThumbnailUpload = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

router
  .route("/")
  .get(listVideos) // GET /api/admin/videos
  .post(videoAndThumbnailUpload, createVideo); // POST /api/admin/videos

router
  .route("/:id")
  .get(getVideoById) // GET /api/admin/videos/:id
  .patch(videoAndThumbnailUpload, updateVideo) // PATCH /api/admin/videos/:id
  .delete(deleteVideo); // DELETE /api/admin/videos/:id (soft delete)

export default router;


