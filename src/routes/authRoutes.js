import express from "express";
import multer from "multer";
import {
  register,
  login,
  firebaseLogin,
  oauthCallback,
  getCurrentUser,
  updateProfile,
  uploadProfileAvatar,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Use memory storage for Vercel serverless compatibility
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile images
  },
});

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/firebase-login", firebaseLogin); // Firebase Authentication (Google/Apple)
router.post("/oauth", oauthCallback); // Legacy OAuth endpoint
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-token", verifyResetToken);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.put("/profile", authenticate, updateProfile);
router.post("/profile/avatar", authenticate, upload.single("avatar"), uploadProfileAvatar);

export default router;

