import User from '../models/User.js';
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
  const { title, body, type } = req.body;

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

