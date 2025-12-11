import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  saveFCMToken,
  removeFCMToken,
  updateNotificationSettings,
  getNotificationSettings,
} from '../controllers/notificationController.js';

const router = express.Router();

// FCM Token Management
router.post('/fcm-token', authenticate, saveFCMToken);
router.delete('/fcm-token', authenticate, removeFCMToken);

// Notification Settings
router.get('/settings', authenticate, getNotificationSettings);
router.patch('/settings', authenticate, updateNotificationSettings);

export default router;

