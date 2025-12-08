import mongoose from "mongoose";
import QuestionLearning from "../models/QuestionLearning.js";
import Question from "../models/Questions.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../utils/errorHandler.js";

const VALID_LEARNING_TYPES = ["health", "vitality", "general"];

/**
 * @route   GET /api/question-learning
 * @desc    Get learning content for questions (with optional filters)
 * @access  Public (can be made private if needed)
 */
export const getQuestionLearnings = asyncHandler(async (req, res) => {
  const { questionId, learningType, limit = 50, page = 1 } = req.query;

  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (pageNum - 1) * limitNum;

  const filters = { isActive: true };

  // Filter by questionId if provided
  if (questionId) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new AppError("Invalid questionId format", 400);
    }
    filters.questionId = questionId;
  }

  // Filter by learningType if provided
  if (learningType) {
    if (!VALID_LEARNING_TYPES.includes(learningType)) {
      throw new AppError(`Invalid learningType. Must be one of: ${VALID_LEARNING_TYPES.join(", ")}`, 400);
    }
    filters.learningType = learningType;
  }

  const [learnings, total] = await Promise.all([
    QuestionLearning.find(filters)
      .populate("questionId", "questionText category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    QuestionLearning.countDocuments(filters),
  ]);

  res.json({
    success: true,
    page: pageNum,
    limit: limitNum,
    total,
    data: learnings,
  });
});

/**
 * @route   GET /api/question-learning/:id
 * @desc    Get learning content by ID
 * @access  Public (can be made private if needed)
 */
export const getQuestionLearningById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid learning content identifier", 400);
  }

  const learning = await QuestionLearning.findOne({ _id: id, isActive: true })
    .populate("questionId", "questionText category section sectionType")
    .lean();

  if (!learning) {
    throw new AppError("Learning content not found", 404);
  }

  res.json({
    success: true,
    data: learning,
  });
});

/**
 * @route   GET /api/question-learning/question/:questionId
 * @desc    Get learning content for a specific question
 * @access  Public (can be made private if needed)
 */
export const getLearningByQuestionId = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new AppError("Invalid questionId format", 400);
  }

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    throw new AppError("Question not found", 404);
  }

  const learning = await QuestionLearning.findOne({ questionId, isActive: true })
    .populate("questionId", "questionText category section sectionType")
    .lean();

  if (!learning) {
    throw new AppError("Learning content not found for this question", 404);
  }

  res.json({
    success: true,
    data: learning,
  });
});

/**
 * @route   POST /api/question-learning
 * @desc    Create learning content for a question
 * @access  Private (Admin only - can be added later)
 */
export const createQuestionLearning = asyncHandler(async (req, res) => {
  const { questionId, title, content, learningType, thumbnailUrl, readTimeMinutes } = req.body;

  if (!questionId || !title || !content) {
    throw new AppError("questionId, title, and content are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new AppError("Invalid questionId format", 400);
  }

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    throw new AppError("Question not found", 404);
  }

  // Check if learning content already exists for this question
  const existing = await QuestionLearning.findOne({ questionId });
  if (existing) {
    throw new AppError("Learning content already exists for this question. Use update instead.", 400);
  }

  // Validate learningType if provided
  if (learningType && !VALID_LEARNING_TYPES.includes(learningType)) {
    throw new AppError(`Invalid learningType. Must be one of: ${VALID_LEARNING_TYPES.join(", ")}`, 400);
  }

  // Validate readTimeMinutes if provided
  let readTime = 5; // default
  if (readTimeMinutes !== undefined) {
    const parsed = parseInt(readTimeMinutes, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      throw new AppError("readTimeMinutes must be a positive number", 400);
    }
    readTime = parsed;
  }

  const learning = await QuestionLearning.create({
    questionId,
    title: title.trim(),
    content: content.trim(),
    learningType: learningType || "general",
    thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
    readTimeMinutes: readTime,
  });

  const populated = await QuestionLearning.findById(learning._id)
    .populate("questionId", "questionText category")
    .lean();

  res.status(201).json({
    success: true,
    message: "Learning content created successfully",
    data: populated,
  });
});

/**
 * @route   PATCH /api/question-learning/:id
 * @desc    Update learning content
 * @access  Private (Admin only - can be added later)
 */
export const updateQuestionLearning = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid learning content identifier", 400);
  }

  const { title, content, learningType, thumbnailUrl, readTimeMinutes, isActive } = req.body;

  const learning = await QuestionLearning.findById(id);
  if (!learning) {
    throw new AppError("Learning content not found", 404);
  }

  const updates = {};

  if (title !== undefined) {
    if (!title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }
    updates.title = title.trim();
  }

  if (content !== undefined) {
    if (!content.trim()) {
      throw new AppError("Content cannot be empty", 400);
    }
    updates.content = content.trim();
  }

  if (learningType !== undefined) {
    if (!VALID_LEARNING_TYPES.includes(learningType)) {
      throw new AppError(`Invalid learningType. Must be one of: ${VALID_LEARNING_TYPES.join(", ")}`, 400);
    }
    updates.learningType = learningType;
  }

  if (thumbnailUrl !== undefined) {
    updates.thumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : null;
  }

  if (readTimeMinutes !== undefined) {
    const parsed = parseInt(readTimeMinutes, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      throw new AppError("readTimeMinutes must be a positive number", 400);
    }
    updates.readTimeMinutes = parsed;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw new AppError("isActive must be a boolean value", 400);
    }
    updates.isActive = isActive;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("No valid fields provided for update", 400);
  }

  Object.assign(learning, updates);
  await learning.save();

  const populated = await QuestionLearning.findById(learning._id)
    .populate("questionId", "questionText category")
    .lean();

  res.json({
    success: true,
    message: "Learning content updated successfully",
    data: populated,
  });
});

/**
 * @route   DELETE /api/question-learning/:id
 * @desc    Delete learning content (soft delete by setting isActive to false)
 * @access  Private (Admin only - can be added later)
 */
export const deleteQuestionLearning = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid learning content identifier", 400);
  }

  const learning = await QuestionLearning.findById(id);
  if (!learning) {
    throw new AppError("Learning content not found", 404);
  }

  // Soft delete
  learning.isActive = false;
  await learning.save();

  res.json({
    success: true,
    message: "Learning content deleted successfully",
  });
});

