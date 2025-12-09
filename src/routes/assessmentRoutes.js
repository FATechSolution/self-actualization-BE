import express from "express";
import {
  submitAssessment,
  getLatestAssessment,
  getNeedReport,
  getRecommendations,
  downloadAssessmentPDF,
} from "../controllers/assessmentController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/submit", authenticate, submitAssessment);
router.get("/result", authenticate, getLatestAssessment);
router.get("/needs-report", authenticate, getNeedReport);
router.get("/recommendations", authenticate, getRecommendations);
router.get("/download-pdf", authenticate, downloadAssessmentPDF);

export default router;

