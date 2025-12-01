import { verifyToken } from "../../utils/jwt.js";
import Admin from "../../models/Admin.js";
import { AppError } from "../../utils/errorHandler.js";

/**
 * Strict admin authentication middleware.
 * - Expects Authorization: Bearer <token>
 * - Token payload must contain adminId
 * - Attaches admin document to req.admin
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No admin token provided", 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.adminId) {
      throw new AppError("Invalid admin token payload", 401);
    }

    // Fetch admin and attach to request
    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message === "Token has expired" || error.message === "Invalid token") {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Admin authentication failed",
    });
  }
};

/**
 * Optional admin authentication middleware.
 * - If a valid admin token is present, attaches admin to req.admin
 * - If no/invalid token, continues without failing
 */
export const optionalAuthenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded && decoded.adminId) {
        const admin = await Admin.findById(decoded.adminId).select("-password");
        if (admin) {
          req.admin = admin;
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail the request on auth error
    next();
  }
};


