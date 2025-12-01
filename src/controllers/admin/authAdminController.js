import Admin from "../../models/Admin.js";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/errorHandler.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { isValidEmail, validatePassword, validateName } from "../../utils/validation.js";

/**
 * @route   POST /api/admin/auth/register
 * @desc    Register a new admin
 * @access  Public (can be restricted later via seeding or invite flow)
 */
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    throw new AppError("Please provide name, email, and password", 400);
  }

  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    throw new AppError(nameValidation.message, 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new AppError(passwordValidation.message, 400);
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    throw new AppError("Admin with this email already exists", 409);
  }

  // Create admin
  const admin = await Admin.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  // Generate admin token with adminId payload
  const token = generateToken({
    adminId: admin._id.toString(),
    email: admin.email,
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt,
      },
      token,
    },
  });
});

/**
 * @route   POST /api/admin/auth/login
 * @desc    Login admin
 * @access  Public
 */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  // Find admin with password field
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");

  if (!admin) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await admin.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate admin token
  const token = generateToken({
    adminId: admin._id.toString(),
    email: admin.email,
  });

  // For simplicity, we are not tracking lastLogin on admin right now

  res.json({
    success: true,
    message: "Admin login successful",
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      token,
    },
  });
});

/**
 * @route   GET /api/admin/auth/me
 * @desc    Get current authenticated admin
 * @access  Private (Admin)
 */
export const getCurrentAdmin = asyncHandler(async (req, res) => {
  // Admin is attached by authenticateAdmin middleware
  res.json({
    success: true,
    data: {
      admin: req.admin,
    },
  });
});


