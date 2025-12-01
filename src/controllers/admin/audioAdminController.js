import mongoose from "mongoose";
import Audio from "../../models/Audio.js";
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
  const { title, description, category, audioUrl, thumbnailUrl, durationSeconds, sortOrder } =
    req.body;

  if (!title || !durationSeconds) {
    throw new AppError("Title and durationSeconds are required", 400);
  }

  const parsedDuration = Number(durationSeconds);
  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
    throw new AppError("durationSeconds must be a positive number", 400);
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

  const audio = await Audio.create({
    title: title.trim(),
    description: description ? description.trim() : undefined,
    category: category ? category.trim() : undefined,
    audioUrl: finalAudioUrl,
    thumbnailUrl: finalThumbnailUrl,
    durationSeconds: Math.round(parsedDuration),
    sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
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
    updates.category = category ? category.trim() : null;
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
    if (typeof isActive !== "boolean") {
      throw new AppError("isActive must be a boolean value", 400);
    }
    updates.isActive = isActive;
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


