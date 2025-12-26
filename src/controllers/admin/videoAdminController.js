import mongoose from "mongoose";
import Video from "../../models/Video.js";
import Question from "../../models/Questions.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { AppError } from "../../utils/errorHandler.js";
import { uploadImageToCloudinary, uploadMediaToCloudinary } from "../../utils/cloudinary.js";

const parsePaginationParams = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

/**
 * @route   GET /api/admin/videos
 * @desc    List videos for admin with optional filters & pagination
 * @access  Private (Admin)
 */
export const listVideos = asyncHandler(async (req, res) => {
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
    filters.title = regex;
  }

  const [videos, total] = await Promise.all([
    Video.find(filters)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Video.countDocuments(filters),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    data: videos,
  });
});

/**
 * @route   POST /api/admin/videos
 * @desc    Create a new video item
 * @access  Private (Admin)
 */
export const createVideo = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    videoUrl, 
    thumbnailUrl, 
    durationSeconds, 
    sortOrder, 
    isActive,
    questionId,
    needKey,
    needLabel
  } = req.body;

  if (!title || !durationSeconds) {
    throw new AppError("Title and durationSeconds are required", 400);
  }

  if (!category) {
    throw new AppError("Category is required", 400);
  }

  // Validate category
  const validCategories = ["Survival", "Safety", "Social", "Self", "Meta-Needs"];
  if (!validCategories.includes(category)) {
    throw new AppError(`Category must be one of: ${validCategories.join(", ")}`, 400);
  }

  const parsedDuration = Number(durationSeconds);
  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
    throw new AppError("durationSeconds must be a positive number", 400);
  }

  // Handle question/need linking
  let finalQuestionId = null;
  let finalNeedKey = null;
  let finalNeedLabel = null;

  if (questionId) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new AppError("Invalid questionId format", 400);
    }

    const question = await Question.findOne({
      _id: questionId,
      category: category,
      section: 1,
      sectionType: "regular",
      isActive: true,
    }).lean();

    if (!question) {
      throw new AppError(
        `Question with ID "${questionId}" not found in category "${category}" or is inactive`,
        400
      );
    }

    finalQuestionId = question._id;
    finalNeedKey = question.needKey || needKey || null;
    finalNeedLabel = question.needLabel || needLabel || null;
  } else if (needKey) {
    const question = await Question.findOne({
      needKey: needKey.trim(),
      category: category,
      section: 1,
      sectionType: "regular",
      isActive: true,
    }).lean();

    if (question) {
      finalQuestionId = question._id;
      finalNeedKey = question.needKey;
      finalNeedLabel = question.needLabel || needLabel || null;
    } else {
      finalNeedKey = needKey.trim();
      finalNeedLabel = needLabel ? needLabel.trim() : null;
    }
  }

  // Files from multer (see adminVideoRoutes):
  // - video: the main video file
  // - thumbnail: image for the card
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  // Video handling:
  // - If a video file is provided, upload to Cloudinary and derive videoUrl
  // - Otherwise, require videoUrl in the body
  let finalVideoUrl = videoUrl ? videoUrl.trim() : undefined;

  if (videoFile) {
    const fileSource = videoFile.buffer || videoFile.path;
    if (fileSource) {
      const uploadResult = await uploadMediaToCloudinary(fileSource, {
        filename: videoFile.originalname,
      });
      finalVideoUrl = uploadResult.secure_url;
    }
  }

  if (!finalVideoUrl) {
    throw new AppError("Either video file (video) or videoUrl must be provided", 400);
  }

  // Thumbnail handling:
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

  const parsedSortOrder = Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0;
  const parsedIsActive =
    typeof isActive === "string" ? isActive.toLowerCase() !== "false" : isActive ?? true;

  const video = await Video.create({
    title: title.trim(),
    description: description ? description.trim() : undefined,
    category: category,
    questionId: finalQuestionId,
    needKey: finalNeedKey,
    needLabel: finalNeedLabel,
    videoUrl: finalVideoUrl,
    thumbnailUrl: finalThumbnailUrl,
    durationSeconds: Math.round(parsedDuration),
    sortOrder: parsedSortOrder,
    isActive: parsedIsActive,
    createdByAdmin: req.admin?._id || null,
  });

  res.status(201).json({
    success: true,
    message: "Video created successfully",
    data: video,
  });
});

/**
 * @route   GET /api/admin/videos/:id
 * @desc    Get a single video item by ID
 * @access  Private (Admin)
 */
export const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid video identifier", 400);
  }

  const video = await Video.findById(id);

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  res.json({
    success: true,
    data: video,
  });
});

/**
 * @route   PATCH /api/admin/videos/:id
 * @desc    Update an existing video item
 * @access  Private (Admin)
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid video identifier", 400);
  }

  const updates = {};
  const {
    title,
    description,
    category,
    videoUrl,
    thumbnailUrl,
    durationSeconds,
    sortOrder,
    isActive,
    questionId,
    needKey,
    needLabel,
  } = req.body;

  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description ? description.trim() : "";
  }

  if (category !== undefined) {
    if (category) {
      const validCategories = ["Survival", "Safety", "Social", "Self", "Meta-Needs"];
      if (!validCategories.includes(category)) {
        throw new AppError(`Category must be one of: ${validCategories.join(", ")}`, 400);
      }
      updates.category = category;
    } else {
      throw new AppError("Category cannot be empty", 400);
    }
  }

  // Handle question/need updates
  if (questionId !== undefined) {
    if (questionId === null || questionId === "") {
      updates.questionId = null;
      updates.needKey = null;
      updates.needLabel = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        throw new AppError("Invalid questionId format", 400);
      }

      const videoCategory = updates.category || (await Video.findById(id).select("category")).category;

      const question = await Question.findOne({
        _id: questionId,
        category: videoCategory,
        section: 1,
        sectionType: "regular",
        isActive: true,
      }).lean();

      if (!question) {
        throw new AppError(
          `Question with ID "${questionId}" not found in category "${videoCategory}" or is inactive`,
          400
        );
      }

      updates.questionId = question._id;
      updates.needKey = question.needKey || needKey || null;
      updates.needLabel = question.needLabel || needLabel || null;
    }
  } else if (needKey !== undefined) {
    if (needKey === null || needKey === "") {
      updates.needKey = null;
      updates.needLabel = null;
    } else {
      updates.needKey = needKey.trim();
      if (needLabel !== undefined) {
        updates.needLabel = needLabel ? needLabel.trim() : null;
      }
    }
  } else if (needLabel !== undefined) {
    updates.needLabel = needLabel ? needLabel.trim() : null;
  }

  // Video can be updated via new file or direct URL
  if (videoFile) {
    const fileSource = videoFile.buffer || videoFile.path;
    if (fileSource) {
      const uploadResult = await uploadMediaToCloudinary(fileSource, {
        filename: videoFile.originalname,
      });
      updates.videoUrl = uploadResult.secure_url;
    }
  } else if (videoUrl !== undefined) {
    if (!videoUrl || !videoUrl.trim()) {
      throw new AppError("videoUrl cannot be empty", 400);
    }
    updates.videoUrl = videoUrl.trim();
  }

  // Thumbnail can be updated either via new file upload or direct URL
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

  if (durationSeconds !== undefined) {
    const parsedDuration = Number(durationSeconds);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      throw new AppError("durationSeconds must be a positive number", 400);
    }
    updates.durationSeconds = Math.round(parsedDuration);
  }

  if (sortOrder !== undefined) {
    const parsedSort = Number(sortOrder);
    if (!Number.isFinite(parsedSort)) {
      throw new AppError("sortOrder must be a number", 400);
    }
    updates.sortOrder = parsedSort;
  }

  if (isActive !== undefined) {
    const boolVal =
      typeof isActive === "string" ? isActive.toLowerCase() !== "false" : Boolean(isActive);
    updates.isActive = boolVal;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("No valid fields provided for update", 400);
  }

  const video = await Video.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  res.json({
    success: true,
    message: "Video updated successfully",
    data: video,
  });
});

/**
 * @route   DELETE /api/admin/videos/:id
 * @desc    Soft-delete a video item (mark as inactive)
 * @access  Private (Admin)
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid video identifier", 400);
  }

  const video = await Video.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  res.json({
    success: true,
    message: "Video deleted successfully",
  });
});


