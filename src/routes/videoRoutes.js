import express from "express";
import { getVideos, getVideoByIdPublic } from "../controllers/contentController.js";

const router = express.Router();

// Public video listing and detail for app
router.get("/", getVideos); // GET /api/videos
router.get("/:id", getVideoByIdPublic); // GET /api/videos/:id

export default router;


