import mongoose from "mongoose";
import User from "../../models/User.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { AppError } from "../../utils/errorHandler.js";

const parsePaginationParams = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

/**
 * @route   GET /api/admin/users
 * @desc    List all users with optional filters & pagination
 * @access  Private (Admin)
 */
export const listUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { limit, page, skip } = parsePaginationParams(req.query);

  const filters = {};

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    // Search in name and email
    filters.$or = [
      { name: regex },
      { email: regex },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filters)
      .select("-password -passwordResetToken -passwordResetExpires") // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filters),
  ]);

  res.json({
    success: true,
    message: "Users retrieved successfully",
    page,
    limit,
    total,
    data: users,
  });
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a single user by ID
 * @access  Private (Admin)
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const user = await User.findById(id)
    .select("-password -passwordResetToken -passwordResetExpires") // Exclude sensitive fields
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (hard delete)
 * @access  Private (Admin)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

