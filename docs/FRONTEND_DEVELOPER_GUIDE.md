# Frontend Developer Guide - Backend Changes

## Overview
This document outlines all backend changes and new APIs that have been implemented. Use this guide to integrate the new features into the frontend application.

---

## Table of Contents
1. [Profile Image Upload](#1-profile-image-upload)
2. [Reflections Linked to Questions](#2-reflections-linked-to-questions)
3. [V/Q Question Flow](#3-vq-question-flow)
4. [Achievement Recalculation on Goal Completion](#4-achievement-recalculation-on-goal-completion)
5. [Goal Save API Improvements](#5-goal-save-api-improvements)
6. [Focus Streak Calculation](#6-focus-streak-calculation)
7. [Question Learning Content API](#7-question-learning-content-api)

---

## 1. Profile Image Upload

### New Endpoint
**POST** `/api/auth/profile/avatar`

### Description
Allows users to upload their profile avatar image. The image is uploaded to Cloudinary and the user's avatar URL is updated automatically.

### Authentication
Required - Bearer token in Authorization header

### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `avatar` (file): Image file (JPEG, PNG, GIF, WebP)
  - Max file size: 5MB

### Response
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "avatar": "https://cloudinary.com/...",
      ...
    },
    "avatarUrl": "https://cloudinary.com/..."
  }
}
```

### Frontend Integration
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

const response = await fetch('/api/auth/profile/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 2. Reflections Linked to Questions

### Changes
- **Reflection Model**: Added `questionId` field (optional)
- **Create Reflection**: Now accepts `questionId` in request body
- **Update Reflection**: Can update `questionId` field

### Updated Endpoints

#### Create Reflection
**POST** `/api/reflections`

**Request Body**:
```json
{
  "mood": "happy",
  "note": "Feeling great about this question",
  "questionId": "507f1f77bcf86cd799439011",  // NEW: Optional
  "date": "2025-01-15T10:00:00Z"  // Optional
}
```

#### Update Reflection
**PATCH** `/api/reflections/:id`

**Request Body**:
```json
{
  "questionId": "507f1f77bcf86cd799439011",  // NEW: Can update or set to null
  "mood": "happy",
  "note": "..."
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "questionId": "507f1f77bcf86cd799439011",  // NEW field
    "mood": "happy",
    "note": "...",
    "date": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Notes
- `questionId` is **optional** - existing reflections without `questionId` will continue to work
- Setting `questionId` to `null` will unlink the reflection from a question
- The API validates that the question exists before linking

---

## 3. V/Q Question Flow

### Changes
- **Question Model**: Added section metadata fields
  - `section` (Number: 1-3)
  - `sectionType` (String: "regular", "V", "Q")
  - `parentQuestionId` (ObjectId, optional)
  - `sectionOrder` (Number)

### Updated Endpoint

#### Get Questions
**GET** `/api/questions`

### New Query Parameters
- `section` (Number): Filter by section (1, 2, or 3)
  - `1` = First section (regular questions)
  - `2` = V section (Vitality questions about first section)
  - `3` = Q section (Quality questions about first set)
- `sectionType` (String): Filter by section type ("regular", "V", "Q")
- `parentQuestionId` (String): Filter V/Q questions by parent question ID

### Example Requests
```
GET /api/questions?section=1&sectionType=regular
GET /api/questions?section=2&sectionType=V&parentQuestionId=507f1f77bcf86cd799439011
GET /api/questions?section=3&sectionType=Q
```

### Response Format
```json
{
  "success": true,
  "total": 10,
  "selectedCategories": ["Survival", "Safety"],
  "availableCategories": ["Survival", "Safety"],
  "currentSubscriptionType": "Free",
  "filters": {
    "section": 1,
    "sectionType": "regular",
    "parentQuestionId": null
  },
  "data": [
    {
      "_id": "...",
      "questionText": "...",
      "category": "Survival",
      "section": 1,  // NEW
      "sectionType": "regular",  // NEW
      "parentQuestionId": null,  // NEW
      "sectionOrder": 0,  // NEW
      ...
    }
  ]
}
```

### Frontend Flow
1. **First Section**: Get questions with `section=1&sectionType=regular`
2. **After First Section**: Get V questions with `section=2&sectionType=V&parentQuestionId=<questionId>`
3. **Then Q Section**: Get Q questions with `section=3&sectionType=Q`

---

## 4. Achievement Recalculation on Goal Completion

### Changes
- **Automatic**: When a goal is marked as completed, achievements are automatically recalculated
- **Non-blocking**: Recalculation happens in the background (doesn't slow down API response)

### Updated Endpoint

#### Update Goal
**PATCH** `/api/goals/:id`

### Behavior
When `isCompleted: true` is sent in the request:
1. Goal is saved
2. API responds immediately
3. Achievement recalculation runs in background
4. Points, badges, and streaks are updated automatically

### Example Request
```json
PATCH /api/goals/:id
{
  "isCompleted": true
}
```

### Notes
- No additional API call needed - recalculation is automatic
- Frontend can fetch updated achievements after goal completion if needed
- Recalculation errors are logged but don't fail the goal update

---

## 5. Goal Save API Improvements

### Changes
- **Response Format**: Now includes success message
- **Data Serialization**: Proper JSON serialization ensured

### Updated Endpoints

#### Create Goal
**POST** `/api/goals`

**Response**:
```json
{
  "success": true,
  "message": "Goal created successfully",  // NEW
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "...",
    "description": "...",
    "startDate": "...",
    "endDate": "...",
    "type": "Personal",
    "isCompleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Update Goal
**PATCH** `/api/goals/:id`

**Response**:
```json
{
  "success": true,
  "message": "Goal updated successfully",  // NEW
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "...",
    "description": "...",
    "startDate": "...",
    "endDate": "...",
    "type": "Personal",
    "isCompleted": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Frontend Integration
After saving a goal, you can:
1. Use the returned goal data to update the UI
2. Navigate back to the goal tracker page
3. Refresh the goals list if needed

---

## 6. Focus Streak Calculation

### Changes
- **Improved Algorithm**: Better date handling and gap detection
- **More Accurate**: Properly calculates consecutive days with activity

### Endpoints (No Changes)
- **GET** `/api/achievements` - Returns `focusStreak` in response
- **GET** `/api/achievements/streak` - Returns detailed streak information

### Response Format
```json
{
  "success": true,
  "data": {
    "totalPoints": 1500,
    "currentBadge": { "level": 2, "name": "Silver" },
    "focusStreak": 5,  // Improved calculation
    "activityCounts": {
      "assessmentsCompleted": 2,
      "goalsCompleted": 3,
      "reflectionsCreated": 10,
      "daysActive": 15
    },
    ...
  }
}
```

### Streak Details Endpoint
**GET** `/api/achievements/streak`

**Response**:
```json
{
  "success": true,
  "data": {
    "focusStreak": 5,
    "lastActivityDate": "2025-01-15T10:00:00Z",
    "streakAchievements": [
      {
        "id": "streak_3",
        "name": "Getting Started",
        "badgeType": "bronze",
        "unlockedAt": "..."
      }
    ]
  }
}
```

### Notes
- Streak is maintained if user has activity today or yesterday
- Streak resets to 0 if last activity was 2+ days ago
- Multiple activities on the same day count as 1 day

---

## 7. Question Learning Content API

### New Endpoints

#### List Learning Content
**GET** `/api/question-learning`

**Query Parameters**:
- `questionId` (String, optional): Filter by question ID
- `learningType` (String, optional): Filter by type ("health", "vitality", "general")
- `page` (Number, optional): Page number (default: 1)
- `limit` (Number, optional): Items per page (default: 50, max: 100)

**Example**:
```
GET /api/question-learning?questionId=507f1f77bcf86cd799439011&learningType=health
```

**Response**:
```json
{
  "success": true,
  "page": 1,
  "limit": 50,
  "total": 10,
  "data": [
    {
      "_id": "...",
      "questionId": {
        "_id": "...",
        "questionText": "...",
        "category": "Survival"
      },
      "title": "Understanding Health & Vitality",
      "content": "Full learning content here...",
      "learningType": "health",
      "thumbnailUrl": "https://...",
      "readTimeMinutes": 5,
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### Get Learning by Question ID
**GET** `/api/question-learning/question/:questionId`

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "questionId": {
      "_id": "...",
      "questionText": "...",
      "category": "Survival",
      "section": 1,
      "sectionType": "regular"
    },
    "title": "Understanding Health & Vitality",
    "content": "Full learning content...",
    "learningType": "health",
    "thumbnailUrl": "...",
    "readTimeMinutes": 5,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Get Learning by ID
**GET** `/api/question-learning/:id`

#### Create Learning Content
**POST** `/api/question-learning`

**Request Body**:
```json
{
  "questionId": "507f1f77bcf86cd799439011",
  "title": "Understanding Health & Vitality",
  "content": "Full learning content here...",
  "learningType": "health",  // "health", "vitality", or "general"
  "thumbnailUrl": "https://...",  // Optional
  "readTimeMinutes": 5  // Optional, default: 5
}
```

#### Update Learning Content
**PATCH** `/api/question-learning/:id`

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "learningType": "vitality",
  "thumbnailUrl": "...",
  "readTimeMinutes": 8,
  "isActive": true
}
```

#### Delete Learning Content
**DELETE** `/api/question-learning/:id`

**Response**:
```json
{
  "success": true,
  "message": "Learning content deleted successfully"
}
```

### Frontend Integration
After completing the first section of questions, show learning content for each question:

```javascript
// Get learning content for a specific question
const response = await fetch(`/api/question-learning/question/${questionId}`, {
  headers: {
    'Authorization': `Bearer ${token}`  // If authentication is added
  }
});

const { data } = await response.json();
// Display: data.title, data.content, data.learningType, etc.
```

### Notes
- One learning content per question (unique constraint)
- Learning types: "health", "vitality", "general"
- Soft delete: Sets `isActive` to false instead of hard delete
- Question validation: Verifies question exists before creating

---

## Summary of Changes

### New APIs
1. ✅ Profile image upload (`POST /api/auth/profile/avatar`)
2. ✅ Question learning content (full CRUD)

### Updated APIs
1. ✅ Reflections (added `questionId` field)
2. ✅ Questions (added section metadata and filters)
3. ✅ Goals (improved response format, auto achievement recalculation)
4. ✅ Achievements (improved focus streak calculation)

### Breaking Changes
**None** - All changes are backward compatible. Existing functionality continues to work.

### Migration Notes
- Existing reflections without `questionId` will continue to work
- Existing questions default to `section: 1, sectionType: "regular"`
- All new fields are optional or have defaults

---

## Base URL
Production: `https://self-actualization-analysis-be.vercel.app`
Development: `http://localhost:5000` (or your local port)

## Authentication
Most endpoints require authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling
All APIs return errors in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Questions?
If you have any questions about these changes or need clarification, please contact the backend team.

