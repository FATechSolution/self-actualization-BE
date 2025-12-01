import mongoose from "mongoose";
import Article from "../../models/Article.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { AppError } from "../../utils/errorHandler.js";
import { uploadImageToCloudinary } from "../../utils/cloudinary.js";

const parsePaginationParams = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

/**
 * @route   GET /api/admin/articles
 * @desc    List articles for admin with optional filters & pagination
 * @access  Private (Admin)
 */
export const listArticles = asyncHandler(async (req, res) => {
  const { search, category, status } = req.query;
  const { limit, page, skip } = parsePaginationParams(req.query);

  const filters = {};

  // Status filter: active (default), inactive, or all
  if (status === "inactive") {
    filters.isActive = false;
  } else if (status === "all") {
    // no isActive filter
  } else {
    // default to active items only
    filters.isActive = true;
  }

  if (category) {
    filters.category = category.trim();
  }

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    // Search in title
    filters.title = regex;
  }

  const [articles, total] = await Promise.all([
    Article.find(filters)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(filters),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    data: articles,
  });
});

/**
 * @route   POST /api/admin/articles
 * @desc    Create a new article
 * @access  Private (Admin)
 */
export const createArticle = asyncHandler(async (req, res) => {
  const { title, content, category, thumbnailUrl, readTimeMinutes, sortOrder } = req.body;

  if (!title || !content || !readTimeMinutes) {
    throw new AppError("Title, content, and readTimeMinutes are required", 400);
  }

  const parsedReadTime = Number(readTimeMinutes);
  if (!Number.isFinite(parsedReadTime) || parsedReadTime <= 0) {
    throw new AppError("readTimeMinutes must be a positive number", 400);
  }

  const thumbnailFile = req.files?.thumbnail?.[0];

  let finalThumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : undefined;

  if (thumbnailFile) {
    const fileSource = thumbnailFile.buffer || thumbnailFile.path;
    if (fileSource) {
      const uploadResult = await uploadImageToCloudinary(fileSource, {
        filename: thumbnailFile.originalname,
      });
      finalThumbnailUrl = uploadResult.secure_url;
    }
  }

  const article = await Article.create({
    title: title.trim(),
    content: content.trim(),
    category: category ? category.trim() : undefined,
    thumbnailUrl: finalThumbnailUrl,
    readTimeMinutes: Math.round(parsedReadTime),
    sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    createdByAdmin: req.admin?._id || null,
  });

  res.status(201).json({
    success: true,
    message: "Article created successfully",
    data: article,
  });
});

/**
 * @route   GET /api/admin/articles/:id
 * @desc    Get a single article by ID
 * @access  Private (Admin)
 */
export const getArticleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid article identifier", 400);
  }

  const article = await Article.findById(id);

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  res.json({
    success: true,
    data: article,
  });
});

/**
 * @route   PATCH /api/admin/articles/:id
 * @desc    Update an existing article
 * @access  Private (Admin)
 */
export const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid article identifier", 400);
  }

  const updates = {};
  const { title, content, category, thumbnailUrl, readTimeMinutes, sortOrder, isActive } =
    req.body;

  const thumbnailFile = req.files?.thumbnail?.[0];

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }
    updates.title = title.trim();
  }

  if (content !== undefined) {
    if (!content || !content.trim()) {
      throw new AppError("Content cannot be empty", 400);
    }
    updates.content = content.trim();
  }

  if (category !== undefined) {
    updates.category = category ? category.trim() : null;
  }

  // Thumbnail update: file or direct URL
  if (thumbnailFile) {
    const fileSource = thumbnailFile.buffer || thumbnailFile.path;
    if (fileSource) {
      const uploadResult = await uploadImageToCloudinary(fileSource, {
        filename: thumbnailFile.originalname,
      });
      updates.thumbnailUrl = uploadResult.secure_url;
    }
  } else if (thumbnailUrl !== undefined) {
    updates.thumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : null;
  }

  if (readTimeMinutes !== undefined) {
    const parsedReadTime = Number(readTimeMinutes);
    if (!Number.isFinite(parsedReadTime) || parsedReadTime <= 0) {
      throw new AppError("readTimeMinutes must be a positive number", 400);
    }
    updates.readTimeMinutes = Math.round(parsedReadTime);
  }

  if (sortOrder !== undefined) {
    const parsedSort = Number(sortOrder);
    if (!Number.isFinite(parsedSort)) {
      throw new AppError("sortOrder must be a number", 400);
    }
    updates.sortOrder = parsedSort;
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

  const article = await Article.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  res.json({
    success: true,
    message: "Article updated successfully",
    data: article,
  });
});

/**
 * @route   DELETE /api/admin/articles/:id
 * @desc    Soft-delete an article item (mark as inactive)
 * @access  Private (Admin)
 */
export const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid article identifier", 400);
  }

  const article = await Article.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  res.json({
    success: true,
    message: "Article deleted successfully",
  });
});


