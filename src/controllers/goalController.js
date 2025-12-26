import mongoose from "mongoose";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import Question from "../models/Questions.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../utils/errorHandler.js";
import { calculateUserAchievements } from "./achievementController.js";
import { validateCategoriesForSubscription } from "../utils/subscription.js";
import { sendNotificationToUser } from "../services/notificationService.js";

const GOAL_TYPES = ["Survival", "Safety", "Social", "Self", "Meta-Needs"];

/**
 * Validate goal level fields (currentLevel and targetLevel)
 * @param {Object} data - Data object containing level fields
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Array} Array of error messages (empty if valid)
 */
const validateGoalLevels = (data, isUpdate = false) => {
  const errors = [];

  // Validate currentLevel
  if (data.currentLevel !== undefined) {
    const level = Number(data.currentLevel);
    if (Number.isNaN(level)) {
      errors.push("currentLevel must be a number");
    } else if (level < 1 || level > 7) {
      errors.push("currentLevel must be between 1 and 7");
    }
  } else if (!isUpdate) {
    errors.push("currentLevel is required");
  }

  // Validate targetLevel
  if (data.targetLevel !== undefined) {
    const level = Number(data.targetLevel);
    if (Number.isNaN(level)) {
      errors.push("targetLevel must be a number");
    } else if (level < 1 || level > 7) {
      errors.push("targetLevel must be between 1 and 7");
    }
  } else if (!isUpdate) {
    errors.push("targetLevel is required");
  }

  // Validate targetLevel >= currentLevel
  if (data.currentLevel !== undefined && data.targetLevel !== undefined) {
    const current = Number(data.currentLevel);
    const target = Number(data.targetLevel);
    if (!Number.isNaN(current) && !Number.isNaN(target) && target < current) {
      errors.push("targetLevel should be greater than or equal to currentLevel");
    }
  }

  // Validate userNotes length
  if (data.userNotes !== undefined && data.userNotes && data.userNotes.length > 500) {
    errors.push("userNotes must be 500 characters or less");
  }

  return errors;
};

const parseDate = (value, fieldName) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} must be a valid date`, 400);
  }
  return date;
};

export const createGoal = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const {
    title,
    description,
    userNotes,
    startDate,
    endDate,
    type,
    needKey,
    needLabel,
    needOrder,
    questionId,
    currentLevel,
    targetLevel,
  } = req.body;

  // Validate required fields for new level-based system
  if (!type) {
    throw new AppError("Goal type is required", 400);
  }

  if (!GOAL_TYPES.includes(type)) {
    throw new AppError(`Invalid goal type. Allowed types: ${GOAL_TYPES.join(", ")}`, 400);
  }

  // Validate level fields
  if (currentLevel === undefined || currentLevel === null) {
    throw new AppError("currentLevel is required (1-7)", 400);
  }

  if (targetLevel === undefined || targetLevel === null) {
    throw new AppError("targetLevel is required (1-7)", 400);
  }

  // Validate level ranges
  const parsedCurrentLevel = Number(currentLevel);
  const parsedTargetLevel = Number(targetLevel);

  if (Number.isNaN(parsedCurrentLevel) || parsedCurrentLevel < 1 || parsedCurrentLevel > 7) {
    throw new AppError("currentLevel must be a number between 1 and 7", 400);
  }

  if (Number.isNaN(parsedTargetLevel) || parsedTargetLevel < 1 || parsedTargetLevel > 7) {
    throw new AppError("targetLevel must be a number between 1 and 7", 400);
  }

  // Optional: Validate targetLevel >= currentLevel
  if (parsedTargetLevel < parsedCurrentLevel) {
    throw new AppError("targetLevel should be greater than or equal to currentLevel", 400);
  }

  // Validate userNotes length
  if (userNotes && userNotes.length > 500) {
    throw new AppError("userNotes must be 500 characters or less", 400);
  }

  // Validate category against user's subscription
  const user = await User.findById(userId).select("currentSubscriptionType");
  const subscriptionType = user?.currentSubscriptionType || "Free";
  const validation = validateCategoriesForSubscription([type], subscriptionType);
  if (!validation.isValid) {
    throw new AppError(validation.message, 403);
  }

  // If questionId is provided directly, validate it
  let finalQuestionId = questionId || null;
  if (questionId) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new AppError("Invalid questionId format", 400);
    }
    const question = await Question.findOne({
      _id: questionId,
      category: type,
      section: 1,
      sectionType: "regular",
      isActive: true,
    }).lean();

    if (!question) {
      throw new AppError(
        `Question with ID "${questionId}" not found in category "${type}" or is inactive`,
        400
      );
    }
  }

  // If needKey is provided, validate it exists and belongs to the selected category
  let finalNeedKey = needKey || null;
  let finalNeedLabel = needLabel || null;
  let finalNeedOrder = needOrder || null;
  let finalTitle = title ? title.trim() : null;

  if (needKey) {
    // Validate need exists and belongs to the selected category
    const needQuestion = await Question.findOne({
      needKey: needKey.trim(),
      category: type,
      section: 1,
      sectionType: "regular",
      isActive: true,
    }).lean();

    if (!needQuestion) {
      throw new AppError(
        `Need "${needKey}" not found in category "${type}" or is inactive`,
        400
      );
    }

    // Use need metadata from question
    finalNeedKey = needQuestion.needKey;
    finalNeedLabel = needQuestion.needLabel || needLabel;
    finalNeedOrder = needQuestion.needOrder || needOrder;

    // If questionId not provided directly, use the one from needKey lookup
    if (!finalQuestionId) {
      finalQuestionId = needQuestion._id;
    } else {
      // If both provided, validate they match
      if (finalQuestionId.toString() !== needQuestion._id.toString()) {
        throw new AppError(
          `questionId "${questionId}" does not match needKey "${needKey}"`,
          400
        );
      }
    }

    // Auto-fill title with needLabel if title not provided
    if (!finalTitle && finalNeedLabel) {
      finalTitle = finalNeedLabel; // Use needLabel directly as title
    }
  }

  if (!finalTitle) {
    throw new AppError("Title is required. Provide title or select a need.", 400);
  }

  // Parse dates if provided (now optional)
  let parsedStartDate = null;
  let parsedEndDate = null;

  if (startDate) {
    parsedStartDate = parseDate(startDate, "Start date");
  }

  if (endDate) {
    parsedEndDate = parseDate(endDate, "End date");
  }

  // Validate date relationship if both provided
  if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
    throw new AppError("End date must be on or after the start date", 400);
  }

  const goal = await Goal.create({
    userId,
    title: finalTitle,
    description: description ? description.trim() : undefined,
    userNotes: userNotes ? userNotes.trim() : "",
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    type,
    needKey: finalNeedKey,
    needLabel: finalNeedLabel,
    needOrder: finalNeedOrder,
    questionId: finalQuestionId,
    currentLevel: parsedCurrentLevel,
    targetLevel: parsedTargetLevel,
  });

  // Ensure all fields are included in response
  const goalData = goal.toObject ? goal.toObject() : goal;

  res.status(201).json({
    success: true,
    message: "Goal created successfully",
    data: goalData,
  });
});

export const getGoals = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { status } = req.query;
  const filters = { userId };

  if (status) {
    if (status === "active") {
      filters.isCompleted = false;
    } else if (status === "completed") {
      filters.isCompleted = true;
    } else {
      throw new AppError("Status must be either 'active' or 'completed'", 400);
    }
  }

  const goals = await Goal.find(filters).sort({ createdAt: -1 }).lean();

  res.json({ success: true, total: goals.length, data: goals });
});

export const getGoalById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid goal identifier", 400);
  }

  const goal = await Goal.findOne({ _id: id, userId }).lean();

  if (!goal) {
    throw new AppError("Goal not found", 404);
  }

  res.json({ success: true, data: goal });
});

export const updateGoal = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid goal identifier", 400);
  }

  // Find existing goal first
  const existingGoal = await Goal.findOne({ _id: id, userId });

  if (!existingGoal) {
    throw new AppError("Goal not found", 404);
  }

  const updates = {};
  const {
    title,
    description,
    userNotes,
    startDate,
    endDate,
    type,
    isCompleted,
    needKey,
    needLabel,
    needOrder,
    currentLevel,
    targetLevel,
  } = req.body;

  // Update title
  if (title !== undefined) {
    if (!title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }
    updates.title = title.trim();
  }

  // Update description (backward compatibility)
  if (description !== undefined) {
    updates.description = description ? description.trim() : "";
  }

  // Update userNotes
  if (userNotes !== undefined) {
    if (userNotes && userNotes.length > 500) {
      throw new AppError("userNotes must be 500 characters or less", 400);
    }
    updates.userNotes = userNotes ? userNotes.trim() : "";
  }

  // Update currentLevel
  if (currentLevel !== undefined) {
    const parsedCurrentLevel = Number(currentLevel);
    if (Number.isNaN(parsedCurrentLevel) || parsedCurrentLevel < 1 || parsedCurrentLevel > 7) {
      throw new AppError("currentLevel must be a number between 1 and 7", 400);
    }
    updates.currentLevel = parsedCurrentLevel;
  }

  // Update targetLevel
  if (targetLevel !== undefined) {
    const parsedTargetLevel = Number(targetLevel);
    if (Number.isNaN(parsedTargetLevel) || parsedTargetLevel < 1 || parsedTargetLevel > 7) {
      throw new AppError("targetLevel must be a number between 1 and 7", 400);
    }
    updates.targetLevel = parsedTargetLevel;
  }

  // Validate level relationship if both are being updated
  const finalCurrentLevel = updates.currentLevel !== undefined ? updates.currentLevel : existingGoal.currentLevel;
  const finalTargetLevel = updates.targetLevel !== undefined ? updates.targetLevel : existingGoal.targetLevel;

  if (finalTargetLevel < finalCurrentLevel) {
    throw new AppError("targetLevel should be greater than or equal to currentLevel", 400);
  }

  // Update type
  if (type !== undefined) {
    if (!GOAL_TYPES.includes(type)) {
      throw new AppError(`Invalid goal type. Allowed types: ${GOAL_TYPES.join(", ")}`, 400);
    }
    updates.type = type;
  }

  // Handle need updates
  if (needKey !== undefined) {
    const goalType = updates.type || existingGoal.type;

    if (needKey === null || needKey === "") {
      // Clear need fields
      updates.needKey = null;
      updates.needLabel = null;
      updates.needOrder = null;
      updates.questionId = null;
    } else {
      // Validate need exists and belongs to the selected category
      const needQuestion = await Question.findOne({
        needKey: needKey.trim(),
        category: goalType,
        section: 1,
        sectionType: "regular",
        isActive: true,
      }).lean();

      if (!needQuestion) {
        throw new AppError(
          `Need "${needKey}" not found in category "${goalType}" or is inactive`,
          400
        );
      }

      // Use need metadata from question
      updates.needKey = needQuestion.needKey;
      updates.needLabel = needQuestion.needLabel || needLabel || null;
      updates.needOrder = needQuestion.needOrder || needOrder || null;
      updates.questionId = needQuestion._id;

      // Auto-update title if not explicitly provided and needLabel exists
      if (!updates.title && updates.needLabel) {
        updates.title = updates.needLabel;
      }
    }
  } else if (needLabel !== undefined || needOrder !== undefined) {
    // If needKey not provided but needLabel/needOrder are, validate needKey exists
    if (!existingGoal.needKey) {
      throw new AppError("Cannot update needLabel/needOrder without needKey", 400);
    }
    if (needLabel !== undefined) updates.needLabel = needLabel;
    if (needOrder !== undefined) updates.needOrder = needOrder;
  }

  // Handle completion
  if (isCompleted !== undefined) {
    if (typeof isCompleted !== "boolean") {
      throw new AppError("isCompleted must be a boolean value", 400);
    }
    updates.isCompleted = isCompleted;

    // Auto-set completedAt when marking as completed
    if (isCompleted === true && !existingGoal.isCompleted) {
      updates.completedAt = new Date();
    }

    // Clear completedAt when marking as incomplete
    if (isCompleted === false && existingGoal.isCompleted) {
      updates.completedAt = null;
    }
  }

  // Update dates (optional)
  let parsedStartDate;
  if (startDate !== undefined) {
    if (startDate === null || startDate === "") {
      updates.startDate = null;
    } else {
      parsedStartDate = parseDate(startDate, "Start date");
      updates.startDate = parsedStartDate;
    }
  }

  let parsedEndDate;
  if (endDate !== undefined) {
    if (endDate === null || endDate === "") {
      updates.endDate = null;
    } else {
      parsedEndDate = parseDate(endDate, "End date");
      updates.endDate = parsedEndDate;
    }
  }

  // Validate date relationship if both dates exist
  const finalStartDate = updates.startDate !== undefined ? updates.startDate : existingGoal.startDate;
  const finalEndDate = updates.endDate !== undefined ? updates.endDate : existingGoal.endDate;

  if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
    throw new AppError("End date must be on or after the start date", 400);
  }

  // Check if goal is being marked as completed (for achievement recalculation)
  const wasCompleted = existingGoal.isCompleted;
  const willBeCompleted = updates.isCompleted !== undefined ? updates.isCompleted : wasCompleted;
  const isBeingCompleted = !wasCompleted && willBeCompleted;

  // Apply updates
  Object.assign(existingGoal, updates);
  await existingGoal.save();

  // Trigger achievement recalculation if goal was just completed
  if (isBeingCompleted) {
    try {
      // Recalculate achievements in the background (don't wait for it to complete)
      // This ensures the API response is fast while achievements update asynchronously
      calculateUserAchievements(userId).catch((error) => {
        // Log error but don't fail the request
        console.error("Error recalculating achievements after goal completion:", error);
      });

      // If user hit 3 completed goals, mark coaching offer eligible
      const completedCount = await Goal.countDocuments({ userId, isCompleted: true });
      if (completedCount >= 3) {
        await User.findByIdAndUpdate(userId, {
          coachingOfferEligible: true,
          coachingOfferTriggeredAt: new Date(),
        });
      }

      // Send goal completion notification
      sendNotificationToUser(
        userId,
        "Goal Completed! 🎉",
        `Congratulations! You've completed your goal: "${existingGoal.title}"`,
        {
          type: "goal_completed",
          goalId: existingGoal._id.toString(),
          screen: "/goals",
        }
      ).catch((err) => {
        console.error("Error sending goal completion notification:", err);
        // Don't fail the request if notification fails
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error("Error triggering achievement recalculation:", error);
    }
  }

  // Return updated goal
  const goalData = existingGoal.toObject ? existingGoal.toObject() : existingGoal;

  res.json({
    success: true,
    message: "Goal updated successfully",
    data: goalData,
  });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid goal identifier", 400);
  }

  const goal = await Goal.findOneAndDelete({ _id: id, userId });

  if (!goal) {
    throw new AppError("Goal not found", 404);
  }

  res.json({ success: true, message: "Goal deleted successfully" });
});

// Get needs list by category (for dropdown selection)
export const getNeedsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  if (!category) {
    throw new AppError("Category parameter is required", 400);
  }

  if (!GOAL_TYPES.includes(category)) {
    throw new AppError(`Invalid category. Allowed categories: ${GOAL_TYPES.join(", ")}`, 400);
  }

  // Get all unique needs for this category from regular questions (section 1)
  const needs = await Question.find({
    category,
    section: 1,
    sectionType: "regular",
    isActive: true,
    needKey: { $ne: null },
    needLabel: { $ne: null },
  })
    .select("_id needKey needLabel needOrder category")
    .sort({ needOrder: 1, createdAt: 1 })
    .lean();

  // Remove duplicates based on needKey (in case there are multiple questions per need)
  // Keep the first question's _id as questionId
  const uniqueNeedsMap = new Map();
  needs.forEach((need) => {
    if (need.needKey && !uniqueNeedsMap.has(need.needKey)) {
      uniqueNeedsMap.set(need.needKey, {
        needKey: need.needKey,
        needLabel: need.needLabel,
        needOrder: need.needOrder || 0,
        category: need.category,
        questionId: need._id, // Include questionId
      });
    }
  });

  const uniqueNeeds = Array.from(uniqueNeedsMap.values()).sort((a, b) => {
    if (a.needOrder !== b.needOrder) {
      return (a.needOrder || 0) - (b.needOrder || 0);
    }
    return (a.needLabel || "").localeCompare(b.needLabel || "");
  });

  res.json({
    success: true,
    category,
    total: uniqueNeeds.length,
    data: uniqueNeeds,
  });
});

