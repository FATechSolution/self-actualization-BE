import { asyncHandler } from "../../middlewares/asyncHandler.js";

/**
 * @route   GET /api/admin/dashboard
 * @desc    Basic admin-only dashboard/health endpoint
 * @access  Private (Admin)
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard is accessible",
    data: {
      admin: {
        id: req.admin?._id,
        name: req.admin?.name,
        email: req.admin?.email,
      },
      timestamp: new Date().toISOString(),
    },
  });
});
