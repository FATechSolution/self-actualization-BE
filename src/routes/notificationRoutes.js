import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  saveFCMToken,
  removeFCMToken,
  updateNotificationSettings,
  getNotificationSettings,
  sendTestNotification,
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notificationController.js';

const router = express.Router();

// FCM Token Management
router.post('/fcm-token', authenticate, saveFCMToken);
router.delete('/fcm-token', authenticate, removeFCMToken);

// Notification Settings
router.get('/settings', authenticate, getNotificationSettings);
router.patch('/settings', authenticate, updateNotificationSettings);

// Test Notification (for development/testing)
router.post('/test', authenticate, sendTestNotification);

// Notification CRUD Operations
// Note: Specific routes (like /read-all) must come before parameterized routes (like /:id)
router.get('/', authenticate, getNotifications);
router.patch('/read-all', authenticate, markAllNotificationsAsRead);
router.get('/:id', authenticate, getNotificationById);
router.patch('/:id/read', authenticate, markNotificationAsRead);
router.delete('/:id', authenticate, deleteNotification);
// Delete all must come after delete single (/:id) to avoid conflicts
router.delete('/', authenticate, deleteAllNotifications);

export default router;

