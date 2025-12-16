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

3) **Send Test Notification** (for testing)  
`POST /api/notifications/test`  
Body (all optional):
```json
{
  "title": "Test Notification",
  "body": "This is a test notification",
  "type": "test"
}
```
- Sends a test notification to all devices registered for the authenticated user.
- Use this to verify FCM setup and token registration.
- **Important**: User must have saved FCM token first (use endpoint #1).

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

### Step 1: Save FCM Token
```
POST {{baseUrl}}/api/notifications/fcm-token
Authorization: Bearer {{authToken}}
Content-Type: application/json
{
  "fcmToken": "your-actual-fcm-token-from-flutter"
}
```

### Step 2: Send Test Notification
```
POST {{baseUrl}}/api/notifications/test
Authorization: Bearer {{authToken}}
Content-Type: application/json
{
  "title": "Test Notification",
  "body": "This is a test notification from backend",
  "type": "test"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "data": {
    "title": "Test Notification",
    "body": "This is a test notification from backend",
    "type": "test",
    "sentToDevices": 1,
    "totalDevices": 1,
    "results": [
      {
        "token": "your-fcm-token",
        "success": true,
        "messageId": "projects/.../messages/..."
      }
    ]
  }
}
```

### Step 3: Remove Token (optional)
```
DELETE {{baseUrl}}/api/notifications/fcm-token
Authorization: Bearer {{authToken}}
Content-Type: application/json
{
  "fcmToken": "your-actual-fcm-token-from-flutter"
}
```

## Testing Flow (Complete Steps)

1. **Get FCM Token from Flutter App**
   - Use Firebase Cloud Messaging plugin to get device token
   - Example: `FirebaseMessaging.instance.getToken()`

2. **Save Token to Backend**
   - Call `POST /api/notifications/fcm-token` with the token

3. **Send Test Notification**
   - Call `POST /api/notifications/test` to verify everything works
   - You should receive notification on your device

4. **Verify Notification Received**
   - Check device notification tray
   - Tap notification to verify navigation works

## Notification Management (CRUD Operations)

All notifications sent via FCM are automatically saved to the database. You can retrieve, mark as read, and delete them.

### 1. Get All Notifications
`GET /api/notifications`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `type` (optional) - Filter by type: `goal_completed`, `goal_reminder`, `assessment_reminder`, `test`, `general`
- `isRead` (optional) - Filter by read status: `true` or `false`

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "...",
        "userId": "...",
        "title": "Goal Reminder",
        "body": "Have you completed your goal: \"Improve Sleep\"?",
        "type": "goal_reminder",
        "data": {
          "type": "goal_reminder",
          "goalId": "...",
          "screen": "/goals"
        },
        "isRead": false,
        "readAt": null,
        "fcmMessageId": "...",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "unreadCount": 12
  }
}
```

### 2. Get Single Notification
`GET /api/notifications/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "_id": "...",
      "title": "Goal Reminder",
      "body": "...",
      "type": "goal_reminder",
      "isRead": false,
      "data": {...},
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### 3. Mark Notification as Read
`PATCH /api/notifications/:id/read`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "_id": "...",
      "isRead": true,
      "readAt": "2025-01-15T10:35:00.000Z",
      ...
    }
  }
}
```

### 4. Mark All Notifications as Read
`PATCH /api/notifications/read-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 12
  }
}
```

### 5. Delete Single Notification
`DELETE /api/notifications/:id`

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

### 6. Delete All Notifications
`DELETE /api/notifications`

**Query Parameters:**
- `type` (optional) - Delete only specific type (e.g., `goal_reminder`)

**Response:**
```json
{
  "success": true,
  "message": "All notifications deleted successfully",
  "data": {
    "deletedCount": 45
  }
}
```

## Complete API Endpoints Summary

### FCM Token Management
- `POST /api/notifications/fcm-token` - Save/update FCM token
- `DELETE /api/notifications/fcm-token` - Remove FCM token

### Notification Settings
- `GET /api/notifications/settings` - Get notification settings
- `PATCH /api/notifications/settings` - Update notification settings

### Notification Management
- `GET /api/notifications` - Get all notifications (with pagination & filters)
- `GET /api/notifications/:id` - Get single notification
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete single notification
- `DELETE /api/notifications` - Delete all notifications (optional type filter)

### Testing
- `POST /api/notifications/test` - Send test notification

## FAQs
- Multiple devices? Supported (array of tokens).
- Invalid tokens? Backend auto-removes when FCM reports invalid/expired.
- Do I need question/goal IDs? Only for navigation; backend includes `goalId` in goal-related notifications.
- Are notifications stored? Yes, all sent notifications are automatically saved to the database for retrieval.
- How to show unread count? Use the `unreadCount` field from `GET /api/notifications` response.

