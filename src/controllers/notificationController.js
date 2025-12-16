import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { AppError } from '../utils/errorHandler.js';
import { sendNotificationToUser } from '../services/notificationService.js';

/**
 * Save/Update FCM Token
 * POST /api/notifications/fcm-token
 */
export const saveFCMToken = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { fcmToken } = req.body;

  if (!fcmToken) {
    throw new AppError('FCM token is required', 400);
  }

  if (typeof fcmToken !== 'string' || fcmToken.trim().length === 0) {
    throw new AppError('FCM token must be a non-empty string', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const trimmedToken = fcmToken.trim();

  // Support multiple devices (array) or single token
  if (Array.isArray(user.fcmTokens)) {
    if (!user.fcmTokens.includes(trimmedToken)) {
      user.fcmTokens.push(trimmedToken);
    }
  } else {
    user.fcmTokens = [trimmedToken];
  }
  
  // Keep single token for backward compatibility
  user.fcmToken = trimmedToken;
  await user.save();

  res.json({
    success: true,
    message: 'FCM token saved successfully',
    data: {
      fcmToken: user.fcmToken,
      totalDevices: user.fcmTokens.length,
    },
  });
});

/**
 * Remove FCM Token (on logout or app uninstall)
 * DELETE /api/notifications/fcm-token
 */
export const removeFCMToken = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { fcmToken } = req.body;

  if (!fcmToken) {
    throw new AppError('FCM token is required', 400);
  }

  const user = await User.findById(userId);
  if (user) {
    // Remove from array
    if (Array.isArray(user.fcmTokens)) {
      user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken);
    }
    
    // Clear single token if it matches
    if (user.fcmToken === fcmToken) {
      user.fcmToken = user.fcmTokens.length > 0 ? user.fcmTokens[0] : null;
    }
    
    await user.save();
  }

  res.json({
    success: true,
    message: 'FCM token removed successfully',
  });
});

/**
 * Update notification settings
 * PATCH /api/notifications/settings
 */
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { goalReminders, assessmentReminders } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (goalReminders !== undefined) {
    if (typeof goalReminders !== 'boolean') {
      throw new AppError('goalReminders must be a boolean', 400);
    }
    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }
    user.notificationSettings.goalReminders = goalReminders;
  }

  if (assessmentReminders !== undefined) {
    if (typeof assessmentReminders !== 'boolean') {
      throw new AppError('assessmentReminders must be a boolean', 400);
    }
    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }
    user.notificationSettings.assessmentReminders = assessmentReminders;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: {
      notificationSettings: user.notificationSettings,
    },
  });
});

/**
 * Get notification settings
 * GET /api/notifications/settings
 */
export const getNotificationSettings = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).select('notificationSettings fcmToken');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      notificationSettings: user.notificationSettings || {
        goalReminders: true,
        assessmentReminders: true,
      },
      hasFCMToken: !!user.fcmToken,
    },
  });
});

/**
 * Send Test Notification
 * POST /api/notifications/test
 * This endpoint allows frontend developers to test notifications
 */
export const sendTestNotification = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  
  // Safely destructure req.body with default empty object
  const { title, body, type } = req.body || {};

  // Default values if not provided
  const notificationTitle = title || 'Test Notification';
  const notificationBody = body || 'This is a test notification from the backend';
  const notificationType = type || 'test';

  // Check if user has FCM token
  const user = await User.findById(userId).select('fcmToken fcmTokens');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const tokens = user.fcmTokens && user.fcmTokens.length > 0 
    ? user.fcmTokens 
    : (user.fcmToken ? [user.fcmToken] : []);

  if (tokens.length === 0) {
    throw new AppError(
      'No FCM token found. Please save your FCM token first using POST /api/notifications/fcm-token',
      400
    );
  }

  // Send test notification
  const result = await sendNotificationToUser(
    userId,
    notificationTitle,
    notificationBody,
    {
      type: notificationType,
      test: 'true',
      timestamp: new Date().toISOString(),
    }
  );

  if (!result.success) {
    throw new AppError(
      result.error || 'Failed to send test notification',
      500
    );
  }

  res.json({
    success: true,
    message: 'Test notification sent successfully',
    data: {
      title: notificationTitle,
      body: notificationBody,
      type: notificationType,
      sentToDevices: result.successCount,
      totalDevices: result.totalCount,
      results: result.results,
    },
  });
});

/**
 * Get all notifications for the authenticated user
 * GET /api/notifications
 * Query params: page, limit, type, isRead
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { page = 1, limit = 20, type, isRead } = req.query;

  // Build query
  const query = { userId };
  
  if (type) {
    query.type = type;
  }
  
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get notifications
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Get total count
  const total = await Notification.countDocuments(query);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      unreadCount,
    },
  });
});

/**
 * Get a single notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    userId,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.json({
    success: true,
    data: {
      notification,
    },
  });
});

/**
 * Mark notification(s) as read
 * PATCH /api/notifications/:id/read (single)
 * PATCH /api/notifications/read-all (all)
 */
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    userId,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification,
    },
  });
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const result = await Notification.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: {
      updatedCount: result.modifiedCount,
    },
  });
});

/**
 * Delete a single notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

/**
 * Delete all notifications for the user
 * DELETE /api/notifications
 * Query params: type (optional - delete only specific type)
 */
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { type } = req.query;

  const query = { userId };
  if (type) {
    query.type = type;
  }

  const result = await Notification.deleteMany(query);

  res.json({
    success: true,
    message: 'All notifications deleted successfully',
    data: {
      deletedCount: result.deletedCount,
    },
  });
});

