import mongoose from "mongoose";
import Audio from "../../models/Audio.js";
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
 * @route   GET /api/admin/audios
 * @desc    List audios for admin with optional filters & pagination
 * @access  Private (Admin)
 */
export const listAudios = asyncHandler(async (req, res) => {
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

  const [audios, total] = await Promise.all([
    Audio.find(filters)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Audio.countDocuments(filters),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    data: audios,
  });
});

/**
 * @route   POST /api/admin/audios
 * @desc    Create a new audio item
 * @access  Private (Admin)
 */
export const createAudio = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    audioUrl, 
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
    // If needKey provided without questionId, look up the question
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
      // Allow needKey without question (for custom needs)
      finalNeedKey = needKey.trim();
      finalNeedLabel = needLabel ? needLabel.trim() : null;
    }
  }

  // Files from multer (see adminAudioRoutes):
  // - audio: the main audio file
  // - thumbnail: image for the list card
  const audioFile = req.files?.audio?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  // Audio handling:
  // - If an audio file is provided, upload to Cloudinary and derive audioUrl
  // - Otherwise, require audioUrl in the body
  let finalAudioUrl = audioUrl ? audioUrl.trim() : undefined;

  if (audioFile) {
    // Support both memory storage (buffer) and disk storage (path) for Vercel compatibility
    const fileSource = audioFile.buffer || audioFile.path;
    if (fileSource) {
      const uploadResult = await uploadMediaToCloudinary(fileSource, {
        filename: audioFile.originalname,
      });
      finalAudioUrl = uploadResult.secure_url;
    }
  }

  if (!finalAudioUrl) {
    throw new AppError("Either audio file (audio) or audioUrl must be provided", 400);
  }

  // Thumbnail handling:
  // - If frontend uploaded a file, upload to Cloudinary and use the secure URL.
  // - Otherwise, fall back to thumbnailUrl from the body (optional).
  let finalThumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : undefined;

  if (thumbnailFile) {
    // Support both memory storage (buffer) and disk storage (path) for Vercel compatibility
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

  const audio = await Audio.create({
    title: title.trim(),
    description: description ? description.trim() : undefined,
    category: category,
    questionId: finalQuestionId,
    needKey: finalNeedKey,
    needLabel: finalNeedLabel,
    audioUrl: finalAudioUrl,
    thumbnailUrl: finalThumbnailUrl,
    durationSeconds: Math.round(parsedDuration),
    sortOrder: parsedSortOrder,
    isActive: parsedIsActive,
    createdByAdmin: req.admin?._id || null,
  });

  res.status(201).json({
    success: true,
    message: "Audio created successfully",
    data: audio,
  });
});

/**
 * @route   GET /api/admin/audios/:id
 * @desc    Get a single audio item by ID
 * @access  Private (Admin)
 */
export const getAudioById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid audio identifier", 400);
  }

  const audio = await Audio.findById(id);

  if (!audio) {
    throw new AppError("Audio not found", 404);
  }

  res.json({
    success: true,
    data: audio,
  });
});

/**
 * @route   PATCH /api/admin/audios/:id
 * @desc    Update an existing audio item
 * @access  Private (Admin)
 */
export const updateAudio = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid audio identifier", 400);
  }

  const updates = {};
  const {
    title,
    description,
    category,
    audioUrl,
    thumbnailUrl,
    durationSeconds,
    sortOrder,
    isActive,
    questionId,
    needKey,
    needLabel,
  } = req.body;

  const audioFile = req.files?.audio?.[0];
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
      // Clear question/need fields
      updates.questionId = null;
      updates.needKey = null;
      updates.needLabel = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        throw new AppError("Invalid questionId format", 400);
      }

      const audioCategory = updates.category || (await Audio.findById(id).select("category")).category;

      const question = await Question.findOne({
        _id: questionId,
        category: audioCategory,
        section: 1,
        sectionType: "regular",
        isActive: true,
      }).lean();

      if (!question) {
        throw new AppError(
          `Question with ID "${questionId}" not found in category "${audioCategory}" or is inactive`,
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

  // Audio can be updated via new file or direct URL
  if (audioFile) {
    const fileSource = audioFile.buffer || audioFile.path;
    if (fileSource) {
      const uploadResult = await uploadMediaToCloudinary(fileSource, {
        filename: audioFile.originalname,
      });
      updates.audioUrl = uploadResult.secure_url;
    }
  } else if (audioUrl !== undefined) {
    if (!audioUrl || !audioUrl.trim()) {
      throw new AppError("audioUrl cannot be empty", 400);
    }
    updates.audioUrl = audioUrl.trim();
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

  const audio = await Audio.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!audio) {
    throw new AppError("Audio not found", 404);
  }

  res.json({
    success: true,
    message: "Audio updated successfully",
    data: audio,
  });
});

/**
 * @route   DELETE /api/admin/audios/:id
 * @desc    Soft-delete an audio item (mark as inactive)
 * @access  Private (Admin)
 */
export const deleteAudio = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid audio identifier", 400);
  }

  const audio = await Audio.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!audio) {
    throw new AppError("Audio not found", 404);
  }

  res.json({
    success: true,
    message: "Audio deleted successfully",
  });
});


