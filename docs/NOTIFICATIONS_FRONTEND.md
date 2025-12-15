# Notifications & FCM – Frontend Guide (Flutter)

## What’s implemented in backend
- FCM setup with Firebase Admin (reads creds from env).
- User model stores multiple tokens: `fcmTokens` (array), legacy `fcmToken`.
- Opt-in flags: `notificationSettings.goalReminders`, `notificationSettings.assessmentReminders` (default true).
- Events that send push:
  - Goal completion (immediate).
  - Goal end-date reminder (daily cron, checks goals ending today and not completed).
  - Assessment reminder (daily cron, users who haven’t completed assessment recently).
- REST endpoints to save/remove FCM tokens.

## Endpoints you need
All requests require Bearer token auth.

1) Save/update token  
`POST /api/notifications/fcm-token`  
Body:
```json
{
  "fcmToken": "<device-fcm-token>"
}
```
- Adds the token to `fcmTokens` (deduped). Call on login and whenever token refreshes.

2) Remove token (logout/uninstall)  
`DELETE /api/notifications/fcm-token`  
Body:
```json
{
  "fcmToken": "<device-fcm-token>"
}
```
- Removes this device token from `fcmTokens`.

## Notification payload shape (what the app receives)
```json
{
  "notification": {
    "title": "Goal Reminder",
    "body": "Have you completed your goal: \"Improve Sleep\"?"
  },
  "data": {
    "type": "goal_reminder",   // goal_completed | goal_reminder | assessment_reminder
    "goalId": "<goalId>",      // present for goal_* types
    "screen": "/goals"         // suggested navigation route (string)
  }
}
```
- Use `data.type` to branch navigation.
- `screen` is a hint; frontend can map to actual route names.

## When to call save/remove token (Flutter flow)
1) On app start after login: get FCM token, call `POST /api/notifications/fcm-token`.
2) On token refresh (`onTokenRefresh`): call the same POST with the new token.
3) On logout: call `DELETE /api/notifications/fcm-token` with the current token.
4) If user toggles notifications off (future): backend honors `notificationSettings.*`; for now defaults are ON.

## Handling taps (suggested)
- Foreground: show in-app UI and navigate using `data.type` + ids.
- Background/terminated: when opened from notification, read `data` and route:
  - `goal_completed` / `goal_reminder` → open goals screen; use `goalId` if needed.
  - `assessment_reminder` → open assessment screen.

## Cron jobs note (goal/assessment reminders)
- Backend schedules daily jobs. On platforms without server-side cron (e.g., Vercel free), an external cron/worker must hit the server; confirm with backend where deployed.

## Quick test scripts (Postman/curl)
Save token:
```
POST {{baseUrl}}/api/notifications/fcm-token
Authorization: Bearer {{authToken}}
Content-Type: application/json
{
  "fcmToken": "test-token-123"
}
```

Remove token:
```
DELETE {{baseUrl}}/api/notifications/fcm-token
Authorization: Bearer {{authToken}}
Content-Type: application/json
{
  "fcmToken": "test-token-123"
}
```

## FAQs
- Multiple devices? Supported (array of tokens).
- Invalid tokens? Backend auto-removes when FCM reports invalid/expired.
- Do I need question/goal IDs? Only for navigation; backend includes `goalId` in goal-related notifications.

