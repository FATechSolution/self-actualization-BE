import express from "express";
import multer from "multer";
import {
  listAudios,
  createAudio,
  getAudioById,
  updateAudio,
  deleteAudio,
} from "../../controllers/admin/audioAdminController.js";
import { authenticateAdmin } from "../../middlewares/admin/adminAuth.js";

const router = express.Router();

// Simple disk storage for temporary files before Cloudinary upload
const upload = multer({
  dest: "tmp/uploads",
});

// All audio management routes require admin authentication
router.use(authenticateAdmin);

// Expect multipart/form-data with optional files:
// - audio: audio file to upload to Cloudinary (audioUrl will be derived)
// - thumbnail: image file for thumbnail (thumbnailUrl will be derived)
const audioAndThumbnailUpload = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

router
  .route("/")
  .get(listAudios) // GET /api/admin/audios
  .post(audioAndThumbnailUpload, createAudio); // POST /api/admin/audios

router
  .route("/:id")
  .get(getAudioById) // GET /api/admin/audios/:id
  .patch(audioAndThumbnailUpload, updateAudio) // PATCH /api/admin/audios/:id
  .delete(deleteAudio); // DELETE /api/admin/audios/:id (soft delete)

export default router;


