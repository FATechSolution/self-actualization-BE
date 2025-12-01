/**
 * Achievement system configuration and helpers
 */

// Badge levels and point thresholds
export const BADGE_LEVELS = [
  { level: 1, name: "Bronze", pointsRequired: 0 },
  { level: 2, name: "Silver", pointsRequired: 1000 },
  { level: 3, name: "Gold", pointsRequired: 3000 },
  { level: 4, name: "Platinum", pointsRequired: 6000 },
  { level: 5, name: "Diamond", pointsRequired: 10000 },
];

// Point values for different activities
export const POINT_VALUES = {
  ASSESSMENT_COMPLETED: 100,
  GOAL_COMPLETED: 200,
  REFLECTION_CREATED: 50,
  DAILY_ACTIVITY: 25, // Points for being active on a day
  STREAK_BONUS: 10, // Bonus points per day in streak
};

// Focus streak achievement thresholds
export const FOCUS_STREAK_ACHIEVEMENTS = [
  { days: 3, name: "Getting Started", badgeType: "bronze" },
  { days: 7, name: "Week Warrior", badgeType: "silver" },
  { days: 14, name: "Two Week Champion", badgeType: "silver" },
  { days: 30, name: "Monthly Master", badgeType: "gold" },
  { days: 60, name: "Two Month Hero", badgeType: "gold" },
  { days: 90, name: "Quarter Champion", badgeType: "platinum" },
  { days: 180, name: "Half Year Hero", badgeType: "platinum" },
  { days: 365, name: "Year Legend", badgeType: "diamond" },
];

/**
 * Calculate current badge level based on total points
 */
export function getBadgeLevel(totalPoints) {
  let currentLevel = 1;
  let currentBadge = "Bronze";

  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= BADGE_LEVELS[i].pointsRequired) {
      currentLevel = BADGE_LEVELS[i].level;
      currentBadge = BADGE_LEVELS[i].name;
      break;
    }
  }

  return { level: currentLevel, name: currentBadge };
}

/**
 * Get progress to next badge
 */
export function getNextBadgeProgress(totalPoints) {
  const currentBadge = getBadgeLevel(totalPoints);
  const nextBadgeIndex = BADGE_LEVELS.findIndex((b) => b.level === currentBadge.level + 1);

  if (nextBadgeIndex === -1) {
    // Already at max level
    return {
      nextBadgeLevel: currentBadge.level,
      nextBadgeName: currentBadge.name,
      pointsRequired: 0,
      pointsToNext: 0,
      currentPoints: totalPoints,
      progressPercentage: 100,
    };
  }

  const nextBadge = BADGE_LEVELS[nextBadgeIndex];
  const currentBadgeThreshold = BADGE_LEVELS.find((b) => b.level === currentBadge.level)?.pointsRequired || 0;
  const pointsInCurrentLevel = totalPoints - currentBadgeThreshold;
  const pointsNeededForNext = nextBadge.pointsRequired - currentBadgeThreshold;
  const pointsToNext = nextBadge.pointsRequired - totalPoints;

  return {
    nextBadgeLevel: nextBadge.level,
    nextBadgeName: nextBadge.name,
    pointsRequired: nextBadge.pointsRequired,
    pointsToNext: Math.max(0, pointsToNext),
    currentPoints: totalPoints,
    progressPercentage: Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForNext) * 100)),
  };
}

/**
 * Calculate focus streak based on activity dates
 */
export function calculateFocusStreak(activityDates, lastActivityDate) {
  if (!activityDates || activityDates.length === 0) {
    return 0;
  }

  // Sort dates in descending order
  const sortedDates = [...activityDates]
    .map((d) => new Date(d))
    .sort((a, b) => b - a)
    .map((d) => d.toDateString());

  if (sortedDates.length === 0) {
    return 0;
  }

  // Check if last activity was today or yesterday (to maintain streak)
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  // If last activity is not today or yesterday, streak is broken
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  currentDate.setDate(currentDate.getDate() - 1);

  for (let i = 1; i < sortedDates.length; i++) {
    const expectedDate = currentDate.toDateString();
    if (sortedDates[i] === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if user should unlock a new focus streak achievement
 */
export function getUnlockedStreakAchievements(currentStreak, existingAchievements = []) {
  const unlocked = existingAchievements.map((a) => a.achievementId);
  const newAchievements = [];

  for (const achievement of FOCUS_STREAK_ACHIEVEMENTS) {
    if (currentStreak >= achievement.days && !unlocked.includes(`streak_${achievement.days}`)) {
      newAchievements.push({
        achievementId: `streak_${achievement.days}`,
        achievementName: achievement.name,
        badgeType: achievement.badgeType,
      });
    }
  }

  return newAchievements;
}

