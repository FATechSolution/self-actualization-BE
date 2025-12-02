import express from "express";
import { listUsers, getUserById, deleteUser } from "../../controllers/admin/userAdminController.js";
import { authenticateAdmin } from "../../middlewares/admin/adminAuth.js";

const router = express.Router();

// All routes require admin authentication
router.get("/", authenticateAdmin, listUsers);
router.get("/:id", authenticateAdmin, getUserById);
router.delete("/:id", authenticateAdmin, deleteUser);

export default router;

