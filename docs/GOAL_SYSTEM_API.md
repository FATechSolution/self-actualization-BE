# Goal System API Documentation

## Overview

The goal system has been redesigned from **time-based completion** to **level-based progress tracking**. Users rate their current satisfaction level (1-7) and set a target level (1-7), then mark goals as complete when they feel they've reached their target.

## Goal Model Schema

```javascript
{
  userId: ObjectId,              // Reference to User
  title: String,                 // Goal title (auto-set from needLabel if not provided)
  description: String,           // Legacy field (kept for backward compatibility)
  userNotes: String,             // User's personal notes (max 500 chars)
  
  // Level-based tracking (NEW)
  currentLevel: Number,          // Current satisfaction level (1-7, required)
  targetLevel: Number,           // Target satisfaction level (1-7, required)
  
  // Optional date fields (for backward compatibility)
  startDate: Date,               // Optional
  endDate: Date,                 // Optional
  
  // Category and need metadata
  type: String,                  // Category: Survival, Safety, Social, Self, Meta-Needs
  needKey: String,               // Machine-friendly slug (e.g., "sleep", "exercise")
  needLabel: String,             // Human-friendly label (e.g., "Sleep", "Exercise")
  needOrder: Number,             // Order within category
  questionId: ObjectId,          // Reference to assessment question
  
  // Completion tracking
  isCompleted: Boolean,          // Completion status
  completedAt: Date,             // Auto-set when marked complete
  
  createdAt: Date,               // Auto-generated
  updatedAt: Date                // Auto-generated
}
```

---

## API Endpoints

### 1. Create Goal

**Endpoint:** `POST /api/goals`

**Authentication:** Required (JWT token)

**Request Body:**

```json
{
  "needKey": "sleep",
  "needLabel": "Sleep",
  "needOrder": 1,
  "type": "Safety",
  "questionId": "64abc123def456...",
  "currentLevel": 4,
  "targetLevel": 7,
  "userNotes": "I want to improve my sleep quality by going to bed earlier and maintaining a consistent schedule."
}
```

**Required Fields:**
- `type` - Category (Survival, Safety, Social, Self, Meta-Needs)
- `currentLevel` - Current satisfaction level (1-7)
- `targetLevel` - Target satisfaction level (1-7)

**Optional Fields:**
- `title` - Auto-set from needLabel if not provided
- `needKey` - Need identifier
- `needLabel` - Need display name
- `needOrder` - Need order
- `questionId` - Assessment question reference
- `userNotes` - Personal notes (max 500 chars)
- `description` - Legacy field
- `startDate` - Optional start date
- `endDate` - Optional end date

**Validation Rules:**
- `currentLevel` must be 1-7
- `targetLevel` must be 1-7
- `targetLevel` >= `currentLevel`
- `userNotes` max 500 characters
- Category must match user's subscription tier

**Success Response (201):**

```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "_id": "goal_id_here",
    "userId": "user_id",
    "title": "Sleep",
    "needKey": "sleep",
    "needLabel": "Sleep",
    "needOrder": 1,
    "type": "Safety",
    "questionId": "64abc123def456...",
    "currentLevel": 4,
    "targetLevel": 7,
    "userNotes": "I want to improve my sleep quality...",
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid levels, missing fields)
- `401` - Not authenticated
- `403` - Category not available in subscription

---

### 2. List Goals

**Endpoint:** `GET /api/goals`

**Authentication:** Required (JWT token)

**Query Parameters:**
- `status` (optional) - Filter by status: `active` or `completed`

**Examples:**
- `GET /api/goals` - Get all goals
- `GET /api/goals?status=active` - Get active goals only
- `GET /api/goals?status=completed` - Get completed goals only

**Success Response (200):**

```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "_id": "goal_1",
      "userId": "user_123",
      "title": "Sleep",
      "needKey": "sleep",
      "needLabel": "Sleep",
      "type": "Safety",
      "currentLevel": 5,
      "targetLevel": 7,
      "userNotes": "Making progress on my sleep schedule...",
      "isCompleted": false,
      "completedAt": null,
      "createdAt": "2025-12-20T10:00:00.000Z",
      "updatedAt": "2025-12-26T10:00:00.000Z"
    },
    {
      "_id": "goal_2",
      "userId": "user_123",
      "title": "Exercise",
      "needKey": "exercise",
      "needLabel": "Exercise",
      "type": "Safety",
      "currentLevel": 3,
      "targetLevel": 6,
      "userNotes": "",
      "isCompleted": true,
      "completedAt": "2025-12-25T15:30:00.000Z",
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-25T15:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Goal

**Endpoint:** `GET /api/goals/:id`

**Authentication:** Required (JWT token)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "goal_1",
    "userId": "user_123",
    "title": "Sleep",
    "needKey": "sleep",
    "needLabel": "Sleep",
    "type": "Safety",
    "currentLevel": 5,
    "targetLevel": 7,
    "userNotes": "Making progress...",
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2025-12-20T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid goal ID
- `401` - Not authenticated
- `404` - Goal not found

---

### 4. Update Goal

**Endpoint:** `PATCH /api/goals/:id`

**Authentication:** Required (JWT token)

**Use Case 1: Update Progress**

```json
{
  "currentLevel": 6,
  "userNotes": "Made great progress this week! Sleeping 7+ hours consistently."
}
```

**Use Case 2: Mark Complete**

```json
{
  "isCompleted": true
}
```

**Backend automatically sets `completedAt` timestamp when marking as complete.**

**Use Case 3: Update Multiple Fields**

```json
{
  "currentLevel": 7,
  "targetLevel": 7,
  "isCompleted": true,
  "userNotes": "Achieved my target! Feeling great."
}
```

**Updatable Fields:**
- `currentLevel` (1-7)
- `targetLevel` (1-7)
- `userNotes` (max 500 chars)
- `isCompleted` (boolean)
- `title`
- `description`
- `startDate`
- `endDate`
- `needKey`, `needLabel`, `needOrder`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Goal updated successfully",
  "data": {
    "_id": "goal_1",
    "currentLevel": 6,
    "targetLevel": 7,
    "userNotes": "Made great progress this week!...",
    "isCompleted": false,
    "updatedAt": "2025-12-26T12:00:00.000Z"
    // ... other fields
  }
}
```

**When marking as complete:**
- `completedAt` is automatically set to current timestamp
- Achievement recalculation is triggered
- Coaching offer eligibility is checked (3+ completed goals)
- Push notification is sent

**Error Responses:**
- `400` - Validation error
- `401` - Not authenticated
- `404` - Goal not found

---

### 5. Delete Goal

**Endpoint:** `DELETE /api/goals/:id`

**Authentication:** Required (JWT token)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

**Error Responses:**
- `400` - Invalid goal ID
- `401` - Not authenticated
- `404` - Goal not found

---

### 6. Get Needs by Category

**Endpoint:** `GET /api/goals/needs/:category`

**Authentication:** Required (JWT token)

**Example:** `GET /api/goals/needs/Safety`

**Success Response (200):**

```json
{
  "success": true,
  "category": "Safety",
  "total": 5,
  "data": [
    {
      "needKey": "sleep",
      "needLabel": "Sleep",
      "needOrder": 1,
      "category": "Safety",
      "questionId": "64abc123def456..."
    },
    {
      "needKey": "exercise",
      "needLabel": "Exercise",
      "needOrder": 2,
      "category": "Safety",
      "questionId": "64abc789ghi012..."
    }
  ]
}
```

---

## Validation Rules

### Level Validation
- `currentLevel` must be a number between 1 and 7
- `targetLevel` must be a number between 1 and 7
- `targetLevel` should be >= `currentLevel`

### Text Field Validation
- `userNotes` max 500 characters
- `title` cannot be empty if provided
- `description` max 300 characters (legacy)

### Category Validation
- Must be one of: Survival, Safety, Social, Self, Meta-Needs
- Must be available in user's subscription tier

### Date Validation (Optional)
- `startDate` must be valid date
- `endDate` must be valid date
- `endDate` must be >= `startDate`

---

## Subscription Tier Access

| Category | Free | Premium | Gold | Coach |
|----------|------|---------|------|-------|
| Survival | ✅ | ✅ | ✅ | ✅ |
| Safety | ✅ | ✅ | ✅ | ✅ |
| Social | ❌ | ✅ | ✅ | ✅ |
| Self | ❌ | ✅ | ✅ | ✅ |
| Meta-Needs | ❌ | ❌ | ✅ | ✅ |

---

## Migration from Old System

If you have existing goals with the old time-based system, run the migration script:

```bash
node Backend/scripts/migrateGoalsToLevelBased.js
```

This will:
- Add `currentLevel: 1` (default starting point)
- Add `targetLevel: 7` (default maximum)
- Migrate `description` to `userNotes`
- Set `completedAt` for already completed goals

---

## Example Workflows

### Creating a Goal from Assessment Results

1. User completes assessment
2. Frontend shows lowest needs
3. User selects a need (e.g., "Sleep" with current score 4)
4. Frontend creates goal:

```json
{
  "needKey": "sleep",
  "needLabel": "Sleep",
  "type": "Safety",
  "questionId": "question_id_from_assessment",
  "currentLevel": 4,
  "targetLevel": 7,
  "userNotes": "Want to improve sleep quality"
}
```

### Tracking Progress

1. User works on their goal
2. After a week, they feel improvement
3. Frontend updates goal:

```json
{
  "currentLevel": 6,
  "userNotes": "Sleeping better! Going to bed at 10pm consistently."
}
```

### Completing a Goal

1. User reaches their target
2. Frontend marks complete:

```json
{
  "isCompleted": true
}
```

3. Backend automatically:
   - Sets `completedAt` timestamp
   - Triggers achievement recalculation
   - Checks coaching offer eligibility
   - Sends push notification

---

## Testing Checklist

- [ ] Create goal with all required fields
- [ ] Create goal with optional fields
- [ ] Create goal without title (auto-set from needLabel)
- [ ] Update goal progress (currentLevel)
- [ ] Update userNotes
- [ ] Mark goal as complete (verify completedAt is set)
- [ ] Mark goal as incomplete (verify completedAt is cleared)
- [ ] List all goals
- [ ] List active goals only
- [ ] List completed goals only
- [ ] Get single goal by ID
- [ ] Delete goal
- [ ] Validate level ranges (reject 0, 8, -1)
- [ ] Validate targetLevel >= currentLevel
- [ ] Validate userNotes length (max 500)
- [ ] Validate subscription tier access
- [ ] Test backward compatibility with old goals

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Category not available in subscription |
| 404 | Not Found - Goal not found |
| 500 | Internal Server Error |
