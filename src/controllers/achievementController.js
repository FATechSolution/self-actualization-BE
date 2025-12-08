import mongoose from "mongoose";
import Achievement from "../models/Achievement.js";
import UserAssessment from "../models/UserAssessment.js";
import Goal from "../models/Goal.js";
import Reflection from "../models/Reflection.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../utils/errorHandler.js";
import {
  getBadgeLevel,
  getNextBadgeProgress,
  calculateFocusStreak,
  getUnlockedStreakAchievements,
  POINT_VALUES,
} from "../utils/achievements.js";

/**
 * Calculate or recalculate user achievements
 * This aggregates all user activities and calculates points, streaks, and badges
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<Object>} Achievement document
 */
export async function calculateUserAchievements(userId) {
  // Get or create achievement record
  let achievement = await Achievement.findOne({ userId });
  if (!achievement) {
    achievement = await Achievement.create({
      userId,
      totalPoints: 0,
      currentBadgeLevel: 1,
      currentBadgeName: "Bronze",
      focusStreak: 0,
      activityCounts: {
        assessmentsCompleted: 0,
        goalsCompleted: 0,
        reflectionsCreated: 0,
        daysActive: 0,
      },
    });
  }

  // Calculate points from assessments
  const assessments = await UserAssessment.find({ userId }).select("completedAt createdAt");
  const assessmentPoints = assessments.length * POINT_VALUES.ASSESSMENT_COMPLETED;
  achievement.activityCounts.assessmentsCompleted = assessments.length;

  // Calculate points from completed goals
  const completedGoals = await Goal.find({ userId, isCompleted: true }).select("updatedAt");
  const goalPoints = completedGoals.length * POINT_VALUES.GOAL_COMPLETED;
  achievement.activityCounts.goalsCompleted = completedGoals.length;

  // Calculate points from reflections
  const reflections = await Reflection.find({ userId }).select("date createdAt");
  const reflectionPoints = reflections.length * POINT_VALUES.REFLECTION_CREATED;
  achievement.activityCounts.reflectionsCreated = reflections.length;

  // Collect all activity dates for streak calculation
  const activityDates = [];
  assessments.forEach((a) => {
    if (a.completedAt) activityDates.push(a.completedAt);
    else if (a.createdAt) activityDates.push(a.createdAt);
  });
  completedGoals.forEach((g) => {
    if (g.updatedAt) activityDates.push(g.updatedAt);
  });
  reflections.forEach((r) => {
    if (r.date) activityDates.push(r.date);
    else if (r.createdAt) activityDates.push(r.createdAt);
  });

  // Calculate unique active days
  const uniqueDays = new Set(
    activityDates.map((date) => {
      const d = new Date(date);
      return d.toDateString();
    })
  );
  achievement.activityCounts.daysActive = uniqueDays.size;
  const dailyActivityPoints = uniqueDays.size * POINT_VALUES.DAILY_ACTIVITY;

  // Calculate focus streak
  const sortedDates = Array.from(uniqueDays)
    .map((d) => new Date(d))
    .sort((a, b) => b - a);
  const streak = calculateFocusStreak(
    sortedDates.map((d) => d.toISOString()),
    achievement.lastActivityDate
  );
  achievement.focusStreak = streak;

  // Streak bonus points
  const streakBonusPoints = streak * POINT_VALUES.STREAK_BONUS;

  // Calculate total points
  const totalPoints =
    assessmentPoints + goalPoints + reflectionPoints + dailyActivityPoints + streakBonusPoints;
  achievement.totalPoints = totalPoints;

  // Update badge level
  const badgeInfo = getBadgeLevel(totalPoints);
  achievement.currentBadgeLevel = badgeInfo.level;
  achievement.currentBadgeName = badgeInfo.name;

  // Update last activity date
  if (sortedDates.length > 0) {
    achievement.lastActivityDate = sortedDates[0];
  }

  // Check for new streak achievements
  const existingAchievements = achievement.unlockedAchievements || [];
  const newStreakAchievements = getUnlockedStreakAchievements(streak, existingAchievements);

  if (newStreakAchievements.length > 0) {
    newStreakAchievements.forEach((newAchievement) => {
      achievement.unlockedAchievements.push({
        achievementId: newAchievement.achievementId,
        achievementName: newAchievement.achievementName,
        unlockedAt: new Date(),
        badgeType: newAchievement.badgeType,
      });
    });
  }

  await achievement.save();
  return achievement;
}

/**
 * @route   GET /api/achievements
 * @desc    Get user's achievements, points, badges, and streaks
 * @access  Private
 */
export const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  // Calculate or get achievements
  const achievement = await calculateUserAchievements(userId);

  // Get progress to next badge
  const badgeProgress = getNextBadgeProgress(achievement.totalPoints);

  // Format response
  const response = {
    success: true,
    data: {
      totalPoints: achievement.totalPoints,
      currentBadge: {
        level: achievement.currentBadgeLevel,
        name: achievement.currentBadgeName,
      },
      badgeProgress: {
        currentPoints: badgeProgress.currentPoints,
        nextBadgeLevel: badgeProgress.nextBadgeLevel,
        nextBadgeName: badgeProgress.nextBadgeName,
        pointsRequired: badgeProgress.pointsRequired,
        pointsToNext: badgeProgress.pointsToNext,
        progressPercentage: badgeProgress.progressPercentage,
      },
      focusStreak: achievement.focusStreak,
      activityCounts: achievement.activityCounts,
      unlockedAchievements: achievement.unlockedAchievements.map((a) => ({
        id: a.achievementId,
        name: a.achievementName,
        badgeType: a.badgeType,
        unlockedAt: a.unlockedAt,
      })),
    },
  };

  res.json(response);
});

/**
 * @route   GET /api/achievements/streak
 * @desc    Get user's focus streak details
 * @access  Private
 */
export const getFocusStreak = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const achievement = await calculateUserAchievements(userId);

  res.json({
    success: true,
    data: {
      focusStreak: achievement.focusStreak,
      lastActivityDate: achievement.lastActivityDate,
      streakAchievements: achievement.unlockedAchievements
        .filter((a) => a.achievementId.startsWith("streak_"))
        .map((a) => ({
          id: a.achievementId,
          name: a.achievementName,
          badgeType: a.badgeType,
          unlockedAt: a.unlockedAt,
        })),
    },
  });
});

/**
 * @route   GET /api/achievements/leaderboard
 * @desc    Get leaderboard of top users by points (optional)
 * @access  Private
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const topAchievements = await Achievement.find()
    .populate("userId", "name email avatar")
    .sort({ totalPoints: -1 })
    .limit(limit)
    .select("userId totalPoints currentBadgeLevel currentBadgeName focusStreak")
    .lean();

  const leaderboard = topAchievements.map((achievement, index) => ({
    rank: index + 1,
    user: {
      id: achievement.userId._id,
      name: achievement.userId.name,
      email: achievement.userId.email,
      avatar: achievement.userId.avatar,
    },
    totalPoints: achievement.totalPoints,
    badgeLevel: achievement.currentBadgeLevel,
    badgeName: achievement.currentBadgeName,
    focusStreak: achievement.focusStreak,
  }));

  res.json({
    success: true,
    data: leaderboard,
  });
});

