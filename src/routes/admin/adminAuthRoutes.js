import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
} from "../../controllers/admin/authAdminController.js";
import { authenticateAdmin } from "../../middlewares/admin/adminAuth.js";

const router = express.Router();

// Public admin auth routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected admin route
router.get("/me", authenticateAdmin, getCurrentAdmin);

export default router;


