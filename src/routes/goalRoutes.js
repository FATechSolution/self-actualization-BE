import express from "express";
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  getNeedsByCategory,
} from "../controllers/goalController.js";
import { authenticate } from "../middlewares/auth.js";
import { authenticateAdmin } from "../middlewares/admin/adminAuth.js";

const router = express.Router();

// Admin route - needs can be accessed by admins for content management
router.get("/needs/:category", authenticateAdmin, getNeedsByCategory);

// User-only routes
router.use(authenticate);

router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:id", getGoalById);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;

