import express from "express";
import {
  getQuestionLearnings,
  getQuestionLearningById,
  getLearningByQuestionId,
  createQuestionLearning,
  updateQuestionLearning,
  deleteQuestionLearning,
} from "../controllers/questionLearningController.js";
// Note: Admin authentication can be added later for create/update/delete routes
// import { authenticateAdmin } from "../middlewares/admin/adminAuth.js";

const router = express.Router();

// Public routes (can be made private if needed)
router.get("/", getQuestionLearnings); // GET /api/question-learning
router.get("/question/:questionId", getLearningByQuestionId); // GET /api/question-learning/question/:questionId
router.get("/:id", getQuestionLearningById); // GET /api/question-learning/:id

// Protected routes (Admin only - uncomment when admin auth is needed)
// router.use(authenticateAdmin);
router.post("/", createQuestionLearning); // POST /api/question-learning
router.patch("/:id", updateQuestionLearning); // PATCH /api/question-learning/:id
router.delete("/:id", deleteQuestionLearning); // DELETE /api/question-learning/:id

export default router;

