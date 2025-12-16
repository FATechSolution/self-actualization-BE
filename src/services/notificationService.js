import admin from '../config/fcm.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Send FCM notification to a single token
 * @param {string} fcmToken - FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} Result object with success status
 */
export const sendNotification = async (fcmToken, title, body, data = {}) => {
  try {
    if (!fcmToken) {
      return { success: false, error: 'FCM token is required' };
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    
    // Remove invalid tokens
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      await removeInvalidToken(fcmToken);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to a user (handles multiple tokens)
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} Result object with success status
 */
export const sendNotificationToUser = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId).select('fcmToken fcmTokens notificationSettings');
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check notification settings
    if ((data.type === 'goal_completed' || data.type === 'goal_reminder') && 
        user.notificationSettings?.goalReminders === false) {
      return { success: false, error: 'User disabled goal reminders' };
    }
    
    if (data.type === 'assessment_reminder' && 
        user.notificationSettings?.assessmentReminders === false) {
      return { success: false, error: 'User disabled assessment reminders' };
    }

    // Get all tokens (support multiple devices)
    const tokens = user.fcmTokens && user.fcmTokens.length > 0 
      ? user.fcmTokens 
      : (user.fcmToken ? [user.fcmToken] : []);

    if (tokens.length === 0) {
      return { success: false, error: 'No FCM token found for user' };
    }

    // Send to all tokens
    const results = [];
    for (const token of tokens) {
      const result = await sendNotification(token, title, body, data);
      results.push({ token, ...result });
    }

    const successCount = results.filter(r => r.success).length;
    
    // Save notification to database (only if at least one notification was sent successfully)
    if (successCount > 0) {
      try {
        const notificationData = {
          userId,
          title,
          body,
          type: data.type || 'general',
          data: new Map(Object.entries(data)),
        };
        
        // Get the first successful message ID if available
        const firstSuccess = results.find(r => r.success && r.messageId);
        if (firstSuccess?.messageId) {
          notificationData.fcmMessageId = firstSuccess.messageId;
        }
        
        await Notification.create(notificationData);
      } catch (dbError) {
        // Log error but don't fail the notification send
        console.error('❌ Error saving notification to database:', dbError);
      }
    }
    
    return { 
      success: successCount > 0, 
      results,
      successCount,
      totalCount: tokens.length
    };
  } catch (error) {
    console.error('❌ Error in sendNotificationToUser:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove invalid FCM token from database
 * @param {string} fcmToken - Invalid FCM token
 */
const removeInvalidToken = async (fcmToken) => {
  try {
    await User.updateMany(
      { 
        $or: [
          { fcmToken: fcmToken },
          { fcmTokens: fcmToken }
        ]
      },
      { 
        $unset: { fcmToken: "" },
        $pull: { fcmTokens: fcmToken }
      }
    );
    console.log('🗑️ Removed invalid FCM token from database');
  } catch (error) {
    console.error('❌ Error removing invalid token:', error);
  }
};

