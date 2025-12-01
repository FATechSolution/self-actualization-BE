import express from "express";
import multer from "multer";
import {
  listArticles,
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
} from "../../controllers/admin/articleAdminController.js";
import { authenticateAdmin } from "../../middlewares/admin/adminAuth.js";

const router = express.Router();

// Simple disk storage for temporary files before Cloudinary upload
const upload = multer({
  dest: "tmp/uploads",
});

// All article management routes require admin authentication
router.use(authenticateAdmin);

// Expect multipart/form-data with optional file:
// - thumbnail: image file for article card
const thumbnailUpload = upload.fields([{ name: "thumbnail", maxCount: 1 }]);

router
  .route("/")
  .get(listArticles) // GET /api/admin/articles
  .post(thumbnailUpload, createArticle); // POST /api/admin/articles

router
  .route("/:id")
  .get(getArticleById) // GET /api/admin/articles/:id
  .patch(thumbnailUpload, updateArticle) // PATCH /api/admin/articles/:id
  .delete(deleteArticle); // DELETE /api/admin/articles/:id (soft delete)

export default router;


