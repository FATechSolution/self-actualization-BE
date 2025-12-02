import { asyncHandler } from "../../middlewares/asyncHandler.js";
import User from "../../models/User.js";
import Audio from "../../models/Audio.js";
import Video from "../../models/Video.js";
import Article from "../../models/Article.js";

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  // Fetch statistics in parallel for better performance
  const [totalUsers, totalAudios, totalVideos, totalArticles] = await Promise.all([
    User.countDocuments({}),
    Audio.countDocuments({}),
    Video.countDocuments({}),
    Article.countDocuments({}),
  ]);

  res.json({
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: {
      stats: {
        totalUsers,
        totalAudios,
        totalVideos,
        totalArticles,
      },
      admin: {
        id: req.admin?._id,
        name: req.admin?.name,
        email: req.admin?.email,
      },
      timestamp: new Date().toISOString(),
    },
  });
});
