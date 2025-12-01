import express from "express";
import { getAdminDashboard } from "../../controllers/admin/dashboardAdminController.js";
import { authenticateAdmin } from "../../middlewares/admin/adminAuth.js";

const router = express.Router();

// Basic admin-only dashboard route
router.get("/", authenticateAdmin, getAdminDashboard);

export default router;
