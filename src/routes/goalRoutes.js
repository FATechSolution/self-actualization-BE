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

const router = express.Router();

// User-only routes (needs endpoint should be accessible to authenticated users)
router.use(authenticate);

// Get needs by category - accessible to authenticated users for goal creation
router.get("/needs/:category", getNeedsByCategory);

router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:id", getGoalById);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;

