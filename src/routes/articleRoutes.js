import express from "express";
import { getArticles, getArticleByIdPublic } from "../controllers/contentController.js";

const router = express.Router();

// Public article listing and detail for app
router.get("/", getArticles); // GET /api/articles
router.get("/:id", getArticleByIdPublic); // GET /api/articles/:id

export default router;


