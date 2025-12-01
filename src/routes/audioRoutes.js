import express from "express";
import { getAudios, getAudioByIdPublic } from "../controllers/contentController.js";

const router = express.Router();

// Public audio listing and detail for app
router.get("/", getAudios); // GET /api/audios
router.get("/:id", getAudioByIdPublic); // GET /api/audios/:id

export default router;


