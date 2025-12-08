import mongoose from "mongoose";
import Question from "../models/Questions.js";
import User from "../models/User.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../utils/errorHandler.js";
import {
  VALID_CATEGORIES,
  DEFAULT_CATEGORIES,
  getCategoriesForSubscription,
  validateCategoriesForSubscription,
} from "../utils/subscription.js";

export const getQuestions = asyncHandler(async (req, res) => {
  const { categories, limit = 100, page = 1, section, sectionType, parentQuestionId } = req.query;

  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);

  // Get user's subscription type
  let currentSubscriptionType = "Free";
  let availableCategories = DEFAULT_CATEGORIES;

  if (req.user) {
    const user = await User.findById(req.user._id).select("currentSubscriptionType");
    if (user && user.currentSubscriptionType) {
      currentSubscriptionType = user.currentSubscriptionType;
      availableCategories = getCategoriesForSubscription(currentSubscriptionType);
    }
  }

  // Parse categories from query (can be comma-separated string or array)
  let selectedCategories = [];
  if (categories) {
    if (typeof categories === "string") {
      selectedCategories = categories.split(",").map((cat) => cat.trim());
    } else if (Array.isArray(categories)) {
      selectedCategories = categories;
    }
  } else {
    // If no categories provided, use all available categories for subscription
    selectedCategories = availableCategories;
  }

  // Validate categories against subscription
  if (req.user) {
    const validation = validateCategoriesForSubscription(selectedCategories, currentSubscriptionType);
    if (!validation.isValid) {
      throw new AppError(validation.message, 403);
    }
  } else {
    // For non-authenticated users, only allow Free categories
    const invalidCategories = selectedCategories.filter((cat) => !DEFAULT_CATEGORIES.includes(cat));
    if (invalidCategories.length > 0) {
      throw new AppError(
        `Unauthorized categories: ${invalidCategories.join(", ")}. Free plan allows: ${DEFAULT_CATEGORIES.join(", ")}`,
        403
      );
    }
  }

  // Validate category names
  const invalidCategoryNames = selectedCategories.filter((cat) => !VALID_CATEGORIES.includes(cat));
  if (invalidCategoryNames.length > 0) {
    throw new AppError(`Invalid category names: ${invalidCategoryNames.join(", ")}`, 400);
  }

  // Build filters
  const filters = {
    isActive: true,
    category: { $in: selectedCategories },
  };

  // Add section filter if provided
  if (section !== undefined) {
    const sectionNum = parseInt(section, 10);
    if (!Number.isNaN(sectionNum) && sectionNum >= 1 && sectionNum <= 3) {
      filters.section = sectionNum;
    } else {
      throw new AppError("Section must be a number between 1 and 3", 400);
    }
  }

  // Add sectionType filter if provided
  if (sectionType !== undefined) {
    const validSectionTypes = ["regular", "V", "Q"];
    if (validSectionTypes.includes(sectionType)) {
      filters.sectionType = sectionType;
    } else {
      throw new AppError(`sectionType must be one of: ${validSectionTypes.join(", ")}`, 400);
    }
  }

  // Add parentQuestionId filter if provided (for V/Q questions)
  if (parentQuestionId !== undefined) {
    if (parentQuestionId === null || parentQuestionId === "null") {
      // Filter for questions without a parent (regular section 1 questions)
      filters.parentQuestionId = null;
    } else {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(parentQuestionId)) {
        throw new AppError("Invalid parentQuestionId format", 400);
      }
      filters.parentQuestionId = parentQuestionId;
    }
  }

  // Build sort order: section -> sectionOrder -> category -> createdAt
  const sortOrder = { section: 1, sectionOrder: 1, category: 1, createdAt: 1 };

  const questions = await Question.find(filters)
    .sort(sortOrder)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  if (!questions.length) {
    throw new AppError("No questions found", 404);
  }

  res.status(200).json({
    success: true,
    total: questions.length,
    selectedCategories,
    availableCategories,
    currentSubscriptionType,
    filters: {
      section: filters.section,
      sectionType: filters.sectionType,
      parentQuestionId: filters.parentQuestionId,
    },
    data: questions,
  });
});

