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
 * Streak is maintained if user has activity today or yesterday
 * @param {string[]} activityDates - Array of ISO date strings
 * @param {Date|null} lastActivityDate - Last recorded activity date (for reference, not used in calculation)
 * @returns {number} Number of consecutive days with activity
 */
export function calculateFocusStreak(activityDates, lastActivityDate) {
  if (!activityDates || activityDates.length === 0) {
    return 0;
  }

  // Convert to Date objects and get unique dates (by date string)
  const dateSet = new Set();
  const dateObjects = activityDates
    .map((d) => {
      try {
        const date = new Date(d);
        if (!Number.isNaN(date.getTime())) {
          const dateStr = date.toDateString();
          if (!dateSet.has(dateStr)) {
            dateSet.add(dateStr);
            return { date, dateStr };
          }
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter((d) => d !== null)
    .sort((a, b) => b.date - a.date); // Sort descending (most recent first)

  if (dateObjects.length === 0) {
    return 0;
  }

  // Get today and yesterday for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  // Check if most recent activity was today or yesterday
  const mostRecentDate = dateObjects[0].date;
  mostRecentDate.setHours(0, 0, 0, 0);
  const mostRecentStr = mostRecentDate.toDateString();

  // If last activity is not today or yesterday, streak is broken
  if (mostRecentStr !== todayStr && mostRecentStr !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days starting from the most recent activity
  let streak = 1;
  let expectedDate = new Date(mostRecentDate);
  expectedDate.setDate(expectedDate.getDate() - 1);

  // Check for consecutive days going backwards
  for (let i = 1; i < dateObjects.length; i++) {
    const activityDate = new Date(dateObjects[i].date);
    activityDate.setHours(0, 0, 0, 0);
    const expectedStr = expectedDate.toDateString();
    const activityStr = activityDate.toDateString();

    if (activityStr === expectedStr) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (activityStr < expectedStr) {
      // Gap found, streak is broken
      break;
    }
    // If activityStr > expectedStr, continue (might be duplicate handling)
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

