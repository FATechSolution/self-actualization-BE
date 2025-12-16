import cron from 'node-cron';
import Goal from '../models/Goal.js';
import User from '../models/User.js';
import UserAssessment from '../models/UserAssessment.js';
import { sendNotificationToUser } from '../services/notificationService.js';

/**
 * Check goals ending today - Run daily at 9 AM
 * Sends reminder: "Have you completed your goal?"
 */
const checkGoalsEndingToday = async () => {
  console.log('⏰ Running goal end date check...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find goals ending today that are not completed
    const goalsEndingToday = await Goal.find({
      endDate: { $gte: today, $lt: tomorrow },
      isCompleted: false,
    }).populate('userId', 'fcmToken fcmTokens notificationSettings');

    let notificationCount = 0;
    for (const goal of goalsEndingToday) {
      // Safety check: Ensure userId is populated and has _id
      if (!goal.userId || !goal.userId._id) {
        console.warn(`⚠️  Goal ${goal._id} has invalid userId, skipping notification`);
        continue;
      }

      if (goal.userId.notificationSettings?.goalReminders !== false) {
        const result = await sendNotificationToUser(
          goal.userId._id.toString(), // Ensure it's a string
          'Goal Reminder',
          `Have you completed your goal: "${goal.title}"?`,
          {
            type: 'goal_reminder',
            goalId: goal._id.toString(),
            screen: '/goals',
          }
        );
        
        if (result.success) {
          notificationCount++;
        }
      }
    }

    console.log(`✅ Goal reminder check completed. Sent ${notificationCount} notifications for ${goalsEndingToday.length} goals ending today`);
  } catch (error) {
    console.error('❌ Error in goal end date check:', error);
  }
};

/**
 * Check for incomplete assessments - Run daily at 10 AM
 * Sends reminder 2-3 days after last assessment (if not completed)
 */
const checkAssessmentReminders = async () => {
  console.log('⏰ Running assessment reminder check...');
  
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    // Find users who:
    // 1. Haven't completed assessment OR completed it more than 3 days ago
    // 2. Haven't been sent a reminder in last 24 hours
    // 3. Have assessment reminders enabled
    const usersNeedingReminder = await User.find({
      $and: [
        {
          $or: [
            { hasCompletedAssessment: false },
            { 
              hasCompletedAssessment: true,
              assessmentCompletedAt: { $lt: threeDaysAgo }
            }
          ]
        },
        {
          $or: [
            { assessmentReminderSentAt: null },
            { assessmentReminderSentAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // More than 1 day ago
          ]
        },
        {
          $or: [
            { 'notificationSettings.assessmentReminders': { $ne: false } },
            { notificationSettings: null } // Default to true if not set
          ]
        }
      ]
    }).select('_id fcmToken fcmTokens notificationSettings assessmentCompletedAt assessmentReminderSentAt');

    let notificationCount = 0;
    for (const user of usersNeedingReminder) {
      // Check if user has assessment in last 2-3 days
      const latestAssessment = await UserAssessment.findOne({ userId: user._id })
        .sort({ createdAt: -1 })
        .lean();

      const shouldSendReminder = !latestAssessment || 
        (latestAssessment.completedAt && new Date(latestAssessment.completedAt) < twoDaysAgo);

      if (shouldSendReminder && user.notificationSettings?.assessmentReminders !== false) {
        const result = await sendNotificationToUser(
          user._id,
          'Complete Your Assessment',
          'It\'s been a while! Complete your self-actualization assessment to track your progress.',
          {
            type: 'assessment_reminder',
            screen: '/assessment',
          }
        );

        if (result.success) {
          notificationCount++;
          // Mark reminder as sent
          await User.findByIdAndUpdate(user._id, {
            assessmentReminderSentAt: new Date(),
          });
        }
      }
    }

    console.log(`✅ Assessment reminder check completed. Sent ${notificationCount} notifications to ${usersNeedingReminder.length} users`);
  } catch (error) {
    console.error('❌ Error in assessment reminder check:', error);
  }
};

// Schedule cron jobs
// Goal reminders: Daily at 9:00 AM
cron.schedule('0 9 * * *', checkGoalsEndingToday, {
  scheduled: true,
  timezone: "UTC"
});

// Assessment reminders: Daily at 10:00 AM
cron.schedule('0 10 * * *', checkAssessmentReminders, {
  scheduled: true,
  timezone: "UTC"
});

console.log('✅ Notification cron jobs scheduled:');
console.log('   - Goal reminders: Daily at 9:00 AM UTC');
console.log('   - Assessment reminders: Daily at 10:00 AM UTC');

// Export for manual testing (optional)
export { checkGoalsEndingToday, checkAssessmentReminders };

