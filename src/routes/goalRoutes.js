import express from "express";
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  getNeedsByCategory,
} from "../controllers/goalController.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.js";

const router = express.Router();

// ============================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================
// Get needs list by category - Public endpoint for dropdown selection
// Uses optional auth to support both authenticated and unauthenticated requests
router.get("/needs/:category", optionalAuthenticate, getNeedsByCategory);

// ============================================================
// PROTECTED ROUTES (Authentication Required)
// ============================================================
// All routes below this line require user authentication
router.use(authenticate);

// Goal CRUD operations
router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:id", getGoalById);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;

