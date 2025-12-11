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

  const { title, description, startDate, endDate, type, needKey, needLabel, needOrder, questionId } = req.body;

  if (!startDate || !endDate || !type) {
    throw new AppError("Missing required fields", 400);
  }

  if (!GOAL_TYPES.includes(type)) {
    throw new AppError(`Invalid goal type. Allowed types: ${GOAL_TYPES.join(", ")}`, 400);
  }

  // Validate category against user's subscription
  const user = await User.findById(userId).select("currentSubscriptionType");
  if (user && user.currentSubscriptionType) {
    const validation = validateCategoriesForSubscription([type], user.currentSubscriptionType);
    if (!validation.isValid) {
      throw new AppError(validation.message, 403);
    }
  } else {
    // Default to Free plan validation
    const freeCategories = ["Survival", "Safety"];
    if (!freeCategories.includes(type)) {
      throw new AppError(
        `Category "${type}" not available for Free subscription. Available: ${freeCategories.join(", ")}`,
        403
      );
    }
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
      finalTitle = `Improve ${finalNeedLabel}`;
    }
  }

  if (!finalTitle) {
    throw new AppError("Title is required. Provide title or select a need.", 400);
  }

  const parsedStartDate = parseDate(startDate, "Start date");
  const parsedEndDate = parseDate(endDate, "End date");

  if (parsedEndDate < parsedStartDate) {
    throw new AppError("End date must be on or after the start date", 400);
  }

  const goal = await Goal.create({
    userId,
    title: finalTitle,
    description: description ? description.trim() : undefined,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    type,
    needKey: finalNeedKey,
    needLabel: finalNeedLabel,
    needOrder: finalNeedOrder,
    questionId: finalQuestionId,
  });

  // Ensure need fields including questionId are included in response
  const goalData = goal.toObject ? goal.toObject() : goal;
  const goalWithNeeds = {
    ...goalData,
    needKey: goal.needKey || null,
    needLabel: goal.needLabel || null,
    needOrder: goal.needOrder || null,
    questionId: goal.questionId || null,
  };

  res.status(201).json({
    success: true,
    message: "Goal created successfully",
    data: goalWithNeeds,
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

  // Ensure need fields are included in response
  const goalsWithNeeds = goals.map(goal => ({
    ...goal,
    needKey: goal.needKey || null,
    needLabel: goal.needLabel || null,
    needOrder: goal.needOrder || null,
    questionId: goal.questionId || null,
  }));

  res.json({ success: true, total: goalsWithNeeds.length, data: goalsWithNeeds });
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

  // Ensure need fields are included in response
  const goalWithNeeds = {
    ...goal,
    needKey: goal.needKey || null,
    needLabel: goal.needLabel || null,
    needOrder: goal.needOrder || null,
    questionId: goal.questionId || null,
  };

  res.json({ success: true, data: goalWithNeeds });
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

  const updates = {};
  const { title, description, startDate, endDate, type, isCompleted, needKey, needLabel, needOrder } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description ? description.trim() : "";
  }

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
      updates.questionId = needQuestion._id; // Store the question ID

      // Auto-update title if not explicitly provided and needLabel exists
      if (!updates.title && updates.needLabel) {
        updates.title = `Improve ${updates.needLabel}`;
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

  if (isCompleted !== undefined) {
    if (typeof isCompleted !== "boolean") {
      throw new AppError("isCompleted must be a boolean value", 400);
    }
    updates.isCompleted = isCompleted;
  }

  let parsedStartDate;
  if (startDate !== undefined) {
    parsedStartDate = parseDate(startDate, "Start date");
    updates.startDate = parsedStartDate;
  }

  let parsedEndDate;
  if (endDate !== undefined) {
    parsedEndDate = parseDate(endDate, "End date");
    updates.endDate = parsedEndDate;
  }

  if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
    throw new AppError("End date must be on or after the start date", 400);
  }

  const existingGoal = await Goal.findOne({ _id: id, userId });

  if (!existingGoal) {
    throw new AppError("Goal not found", 404);
  }

  if (!updates.startDate && parsedEndDate && existingGoal.startDate > parsedEndDate) {
    throw new AppError("End date must be on or after the start date", 400);
  }

  if (!updates.endDate && parsedStartDate && existingGoal.endDate < parsedStartDate) {
    throw new AppError("End date must be on or after the start date", 400);
  }

  // Check if goal is being marked as completed (for achievement recalculation)
  const wasCompleted = existingGoal.isCompleted;
  const willBeCompleted = updates.isCompleted !== undefined ? updates.isCompleted : wasCompleted;
  const isBeingCompleted = !wasCompleted && willBeCompleted;

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
        'Goal Completed! 🎉',
        `Congratulations! You've completed your goal: "${existingGoal.title}"`,
        {
          type: 'goal_completed',
          goalId: existingGoal._id.toString(),
          screen: '/goals',
        }
      ).catch((err) => {
        console.error('Error sending goal completion notification:', err);
        // Don't fail the request if notification fails
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error("Error triggering achievement recalculation:", error);
    }
  }

  // Ensure need fields are included in response
  const goalData = existingGoal.toObject ? existingGoal.toObject() : existingGoal;
  const goalWithNeeds = {
    ...goalData,
    needKey: existingGoal.needKey || null,
    needLabel: existingGoal.needLabel || null,
    needOrder: existingGoal.needOrder || null,
    questionId: existingGoal.questionId || null,
  };

  res.json({
    success: true,
    message: "Goal updated successfully",
    data: goalWithNeeds,
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

