import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  saveFCMToken,
  removeFCMToken,
  updateNotificationSettings,
  getNotificationSettings,
  sendTestNotification,
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

export default router;

