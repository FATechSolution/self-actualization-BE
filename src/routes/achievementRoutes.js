import express from "express";
import { getAchievements, getFocusStreak, getLeaderboard } from "../controllers/achievementController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All achievement routes require authentication
router.use(authenticate);

// Get user's achievements, points, badges, and streaks
router.get("/", getAchievements); // GET /api/achievements

// Get focus streak details
router.get("/streak", getFocusStreak); // GET /api/achievements/streak

// Get leaderboard (optional)
router.get("/leaderboard", getLeaderboard); // GET /api/achievements/leaderboard

export default router;

