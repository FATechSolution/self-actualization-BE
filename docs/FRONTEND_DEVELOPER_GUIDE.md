# Frontend Developer Guide - Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Client Requirements & Flow](#client-requirements--flow)
3. [New Features & Changes](#new-features--changes)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Implementation Guide](#implementation-guide)
6. [UI/UX Requirements](#uiux-requirements)
7. [Subscription & Access Control](#subscription--access-control)
8. [Error Handling](#error-handling)
9. [Testing Checklist](#testing-checklist)

---

## System Overview

### What is Self-Actualization Needs Assessment?

This is a comprehensive assessment system based on Maslow's Hierarchy of Needs, designed to help users:
1. **Assess** their needs across 5 categories (Survival, Safety, Social, Self, Meta-Needs)
2. **Understand** their scores at both category and need levels
3. **Learn** about specific needs through articles, videos, and audio content
4. **Set Goals** to improve areas that need development
5. **Track Progress** through achievements, streaks, and reflections

### System Architecture

```
User Journey:
1. Register/Login → 2. Assessment → 3. Report → 4. Learn & Grow → 5. Set Goal → 6. Track Progress
```

### Key Concepts

- **Categories**: Survival, Safety, Social, Self, Meta-Needs (5 levels of Maslow's pyramid)
- **Needs**: Specific items within categories (e.g., Sleep, Exercise, Money, Food in Survival)
- **Question Flow**: Regular → V (Volume/Quantity) → Q (Quality) for each need
- **Subscription Tiers**: Free, Plus/Premium, Pro/Coach (different category access)

---

## Client Requirements & Flow

### Complete User Flow (As Per Client)

1. **Self-Actualization Needs Assessment**
   - User completes assessment with Regular questions (Section 1)
   - Then V questions (Volume/Quantity) for each Regular question
   - Then Q questions (Quality) for each Regular question

2. **Get Report**
   - Show need-level scores (NOT category-level sliders)
   - Display pyramid visualization with needs positioned
   - Show where user stands on each specific need (sleep, exercise, etc.)

3. **Learn & Grow**
   - Link to specific needs (e.g., "sleep" → sleep article, video, audio)
   - Show learning content after assessment completion
   - Accessible per need, not per category

4. **Set Goal**
   - Prompt: "Which one of your needs would you like to develop more skills in?"
   - Options: "Ask your coach?" or "Set A Goal"
   - After setting goal, show Learn & Grow content

5. **Coaching Offer**
   - After user completes 3rd goal, offer: "Free coaching session valued at $500AUD"
   - User can request session with time preference
   - System provides Zoom link

### Subscription Plans

- **Free Plan**: Survival + Safety categories only
- **Plus Plan** (Premium): Free + Social + Self categories
- **Pro Plan** (Coach): All categories including Meta-Needs

### Important UI Rules

- ❌ **NO category-level sliders** (Survival, Safety, etc.)
- ✅ **YES need-level sliders** (Sleep, Exercise, Money, etc.)
- Show pyramid image with needs positioned
- Link Learn & Grow to specific needs, not categories

---

## New Features & Changes

### 1. Need-Level Metadata in Questions

**What Changed:**
- Questions now have `needKey`, `needLabel`, and `needOrder` fields
- Each question represents a specific need (e.g., "sleep", "exercise", "money")

**Example Question Structure:**
```json
{
  "_id": "...",
  "questionText": "I get 7-8 hours of quality, restorative sleep most nights",
  "category": "Survival",
  "needKey": "sleep",
  "needLabel": "Sleep",
  "needOrder": 1,
  "section": 1,
  "sectionType": "regular",
  "parentQuestionId": null
}
```

### 2. V/Q Question Flow

**Structure:**
- **Section 1 (Regular)**: Main question (e.g., "How good is your sleep?")
- **Section 2 (V)**: Volume/Quantity question (e.g., "How much sleep each night do you get?")
- **Section 3 (Q)**: Quality question (e.g., "What is the quality of your sleep?")

**How to Fetch:**
```javascript
// 1. Get all regular questions (Section 1)
GET /api/questions?section=1&sectionType=regular

// 2. For each regular question, get V questions
GET /api/questions?sectionType=V&parentQuestionId={regularQuestionId}

// 3. For each regular question, get Q questions
GET /api/questions?sectionType=Q&parentQuestionId={regularQuestionId}
```

### 3. Need-Level Scoring in Assessment

**What Changed:**
- Assessment responses now store need metadata
- Assessment results include `needScores` object
- Each need has its own score (not just category scores)

**New Response Structure:**
```json
{
  "success": true,
  "categoryScores": {
    "Survival": 5.2,
    "Safety": 4.8
  },
  "needScores": {
    "sleep": 5.5,
    "exercise": 4.8,
    "food": 5.0,
    "money": 5.2
  },
  "overallScore": 5.0
}
```

### 4. Need-Level Report Endpoint

**Merged Endpoint:** `GET /api/assessment/needs-report` (includes recommendations)

Returns:
- Need-level scores with labels and questionIds
- Lowest needs (for recommendations)
- Learning content links per need
- Category context
- Recommendations (learn, goal, coach actions)
- Primary need (lowest scoring need)
- Suggested prompt for user action

### 6. Coaching Offer Trigger

**What Changed:**
- User model now has `coachingOfferEligible` and `coachingOfferTriggeredAt` fields
- Automatically set to `true` when user completes 3rd goal
- Frontend should check this flag and show offer

### 7. Learn & Grow Content Linking

**What Changed:**
- Learning content is linked to questions (which have needKeys)
- Can fetch content by questionId or needKey
- Supports articles, videos, and audio per need

---

## API Endpoints Reference

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Upload Profile Avatar
```
POST /api/auth/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body: FormData with 'avatar' file
```

---

### Questions

#### Get Questions (Section 1 - Regular)
```
GET /api/questions?section=1&sectionType=regular
Authorization: Bearer {token}

Query Params:
- section: 1 (Regular), 2 (V), 3 (Q)
- sectionType: "regular", "V", "Q"
- parentQuestionId: {id} (for V/Q questions)
- needKey: {string} (filter by need)
- categories: "Survival,Safety" (comma-separated)
- page: 1
- limit: 100

Response:
{
  "success": true,
  "total": 40,
  "selectedCategories": ["Survival", "Safety"],
  "availableCategories": ["Survival", "Safety"],
  "currentSubscriptionType": "Free",
  "filters": {
    "section": 1,
    "sectionType": "regular"
  },
  "data": [
    {
      "_id": "...",
      "questionText": "...",
      "category": "Survival",
      "needKey": "sleep",
      "needLabel": "Sleep",
      "needOrder": 1,
      "section": 1,
      "sectionType": "regular",
      "parentQuestionId": null,
      "sectionOrder": 0,
      "answerOptions": [...],
      "questionType": "Multiple Choice - Horizontal"
    }
  ]
}
```

#### Get V Questions (Volume/Quantity)
```
GET /api/questions?sectionType=V&parentQuestionId={regularQuestionId}
Authorization: Bearer {token}
```

#### Get Q Questions (Quality)
```
GET /api/questions?sectionType=Q&parentQuestionId={regularQuestionId}
Authorization: Bearer {token}
```

#### Get Questions by Need
```
GET /api/questions?needKey=sleep
Authorization: Bearer {token}
```

---

### Assessment

#### Submit Assessment
```
POST /api/assessment/submit
Content-Type: application/json
Authorization: Bearer {token}

{
  "responses": [
    {
      "questionId": "...",
      "selectedOption": 5  // 1-7 scale
    },
    ...
  ]
}

Response:
{
  "success": true,
  "message": "Assessment submitted successfully",
  "categoryScores": {
    "Survival": 5.2,
    "Safety": 4.8
  },
  "needScores": {
    "sleep": 5.5,
    "exercise": 4.8
  },
  "overallScore": 5.0,
  "hasCompletedAssessment": true
}
```

#### Get Latest Assessment Result
```
GET /api/assessment/result
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "assessmentId": "...",
    "categoryScores": {
      "Survival": 5.2,
      "Safety": 4.8,
      "Social": 5.5,
      "Self": 5.0,
      "Meta-Needs": 4.5
    },
    "needScores": {
      "sleep": { "score": 5.5, "needLabel": "Sleep", "category": "Survival" },
      "exercise": { "score": 4.8, "needLabel": "Exercise", "category": "Survival" }
    },
    "overallScore": 5.0,
    "lowestCategories": ["Safety"],
    "completedAt": "...",
    "chartMeta": {
      "performanceBands": [
        {
          "label": "Dysfunctional",
          "subLabels": ["Neurotic", "Psychotic"],
          "range": [1, 1.5],
          "color": "#E63946"
        },
        {
          "label": "Extremes",
          "subLabels": ["Too much", "Too Little"],
          "range": [1.5, 2.5],
          "color": "#DC3545"
        },
        {
          "label": "Not getting by",
          "subLabels": ["Cravings", "Dissatisfaction"],
          "range": [2.5, 3.5],
          "color": "#F1C40F"
        },
        {
          "label": "Doing OK",
          "subLabels": ["Getting By", "Normal Concerns"],
          "range": [3.5, 4.5],
          "color": "#FFC107"
        },
        {
          "label": "Getting by well",
          "subLabels": ["Feeling Good"],
          "range": [4.5, 5.5],
          "color": "#90EE90"
        },
        {
          "label": "Doing Good",
          "subLabels": ["Thriving"],
          "range": [5.5, 6.5],
          "color": "#2ECC71"
        },
        {
          "label": "Optimizing",
          "subLabels": ["Super-Thriving"],
          "range": [6.5, 7],
          "color": "#27AE60"
        },
        {
          "label": "Maximizing",
          "subLabels": ["At ones very best"],
          "range": [7, 7],
          "color": "#1E8449"
        }
      ],
      "categoryDescriptions": {...}
    },
    "pyramidStructure": {
      "needs": {
        "Meta-Needs": [
          "Cognitive needs: to know, understand, learn",
          "Contribution needs: to make a difference",
          "Conative needs: to choose your unique way of life",
          "Love needs: to care and extend yourself to others",
          "Truth needs: to know what is true, real, and authentic",
          "Aesthetic needs: to see, enjoy, and create beauty",
          "Expressive needs: to be and express your best self"
        ],
        "Self": [
          "Importance of your voice and opinion",
          "Honor and Dignity from colleagues",
          "Sense of Respect for Achievements",
          "Sense of Human dignity / Value as Person"
        ],
        "Social": [
          "Group Acceptance / Connection",
          "Bonding with Partner / Lover",
          "Bonding with Significant People",
          "Love / Affection",
          "Social connection: Friends / companions"
        ],
        "Safety": [
          "Sense of Control: Personal Power / efficacy",
          "Sense of Order / Structure",
          "Stability in Life",
          "Career / Job Safety",
          "Physical / Personal Safety"
        ],
        "Survival": [
          "Money",
          "Sex",
          "Exercise",
          "Vitality",
          "Weight Management",
          "Food",
          "Sleep"
        ]
      },
      "needScores": {
        "Survival": [
          {
            "needLabel": "Money",
            "needKey": "money",
            "score": 5.2,
            "questionId": "507f1f77bcf86cd799439011",
            "order": 1
          },
          {
            "needLabel": "Sleep",
            "needKey": "sleep",
            "score": 5.5,
            "questionId": "507f1f77bcf86cd799439012",
            "order": 7
          }
        ]
      },
      "categoryOrder": ["Survival", "Safety", "Social", "Self", "Meta-Needs"]
    }
  }
}
```

**Important Notes:**
- `pyramidStructure.needs` contains the **EXACT needs list from the PDF** - use these exact labels for the pyramid
- `pyramidStructure.needScores` maps user's assessment scores to each need with questionIds
- `pyramidStructure.categoryOrder` shows the order from bottom (Survival) to top (Meta-Needs)
- `chartMeta.performanceBands` contains the **EXACT performance band labels from the PDF** with subLabels
- Use the exact words from `pyramidStructure.needs` for the pyramid visualization

#### Get Need-Level Report (Merged with Recommendations)
```
GET /api/assessment/needs-report
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Need-level report with recommendations",
  "data": {
    "assessmentId": "...",
    "needScores": [
      {
        "needKey": "sleep",
        "needLabel": "Sleep",
        "score": 5.5,
        "category": "Survival",
        "questionId": "507f1f77bcf86cd799439011"  // NEW: Question ID for this need
      },
      {
        "needKey": "exercise",
        "needLabel": "Exercise",
        "score": 3.2,
        "category": "Survival",
        "questionId": "507f1f77bcf86cd799439012"
      },
      ...
    ],
    "categoryScores": {
      "Survival": 4.8,
      "Safety": 5.2
    },
    "lowestNeeds": [
      {
        "needKey": "exercise",
        "needLabel": "Exercise",
        "score": 3.2,
        "category": "Survival",
        "questionId": "507f1f77bcf86cd799439012"
      }
    ],
    "learningByNeed": {
      "exercise": {
        "title": "Understanding Exercise & Fitness",
        "learningType": "health",
        "thumbnailUrl": "...",
        "questionId": "507f1f77bcf86cd799439012",
        "needLabel": "Exercise",
        "category": "Survival"
      }
    },
    "recommendations": [
      {
        "type": "learn",
        "needKey": "exercise",
        "needLabel": "Exercise",
        "questionId": "507f1f77bcf86cd799439012",
        "message": "Explore Learn & Grow content for Exercise"
      },
      {
        "type": "goal",
        "needKey": "exercise",
        "needLabel": "Exercise",
        "questionId": "507f1f77bcf86cd799439012",
        "message": "Set a goal to improve Exercise"
      },
      {
        "type": "coach",
        "needKey": "exercise",
        "needLabel": "Exercise",
        "questionId": "507f1f77bcf86cd799439012",
        "message": "Ask your coach about Exercise"
      }
    ],
    "recommendedActions": [  // Alias for backward compatibility (same as recommendations)
      {
        "type": "learn",
        "needKey": "exercise",
        "needLabel": "Exercise",
        "questionId": "507f1f77bcf86cd799439012",
        "message": "Explore Learn & Grow content for Exercise"
      },
      {
        "type": "goal",
        "needKey": "exercise",
        "needLabel": "Exercise",
        "questionId": "507f1f77bcf86cd799439012",
        "message": "Set a goal to improve Exercise"
      },
      {
        "type": "coach",
        "needKey": "exercise",
        "needLabel": "Exercise",
        "questionId": "507f1f77bcf86cd799439012",
        "message": "Ask your coach about Exercise"
      }
    ],
    "primaryNeed": {
      "needKey": "exercise",
      "needLabel": "Exercise",
      "score": 3.2,
      "category": "Survival",
      "questionId": "507f1f77bcf86cd799439012"
    },
    "suggestedPrompt": "Which one of your needs would you like to develop more skills in?",
    "completedAt": "2025-01-15T10:00:00Z"
  }
}
```

**Note:** The `/api/assessment/recommendations` endpoint is now merged into `/api/assessment/needs-report`. 
The recommendations endpoint still works for backward compatibility but returns the same merged data.

#### Download Assessment PDF
```
GET /api/assessment/download-pdf
Authorization: Bearer {token}

Response: PDF file download
```

---

### Learn & Grow (Question Learning Content)

#### Get Learning Content by Question ID
```
GET /api/question-learning/question/{questionId}
Authorization: Bearer {token} (optional)

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "questionId": {
      "_id": "...",
      "questionText": "...",
      "needKey": "sleep",
      "needLabel": "Sleep"
    },
    "title": "Understanding Sleep & Rest",
    "content": "Full learning content...",
    "learningType": "health",
    "thumbnailUrl": "...",
    "readTimeMinutes": 5,
    "isActive": true
  }
}
```

#### Get Learning Content by Need
```
GET /api/question-learning?needKey=sleep
Authorization: Bearer {token}
```

#### List All Learning Content
```
GET /api/question-learning?page=1&limit=50
Authorization: Bearer {token}
```

---

### Goals

#### Get Needs by Category (NEW)
```
GET /api/goals/needs/{category}
Authorization: Bearer {token}

Path Params:
- category: "Survival" | "Safety" | "Social" | "Self" | "Meta-Needs"

Response:
{
  "success": true,
  "category": "Survival",
  "total": 4,
  "data": [
    {
      "needKey": "sleep",
      "needLabel": "Sleep",
      "needOrder": 1,
      "category": "Survival",
      "questionId": "507f1f77bcf86cd799439011"
    },
    {
      "needKey": "exercise",
      "needLabel": "Exercise",
      "needOrder": 2,
      "category": "Survival",
      "questionId": "507f1f77bcf86cd799439012"
    }
  ]
}

Use this endpoint to populate the need dropdown when user selects a category.
```

#### Create Goal
```
POST /api/goals
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Improve Sleep",  // Optional if needKey provided (auto-filled)
  "description": "Get 8 hours of sleep every night",
  "startDate": "2025-01-15T00:00:00Z",
  "endDate": "2025-02-15T00:00:00Z",
  "type": "Survival",  // Changed: Now uses assessment categories
  "needKey": "sleep",  // NEW: Optional, links goal to specific need
  "needLabel": "Sleep",  // NEW: Optional, auto-filled from needKey
  "needOrder": 1,  // NEW: Optional, auto-filled from needKey
  "questionId": "507f1f77bcf86cd799439011"  // NEW: Optional, can be provided directly or auto-filled from needKey
}

Note:
- If needKey is provided, title is auto-filled as "Improve {needLabel}"
- If needKey is provided, needLabel, needOrder, and questionId are auto-filled from question data
- questionId can be provided directly - it will be validated against the category and needKey
- If both questionId and needKey are provided, they must match
- type must be one of: "Survival", "Safety", "Social", "Self", "Meta-Needs"

Response:
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "Improve Sleep",
    "description": "...",
    "startDate": "...",
    "endDate": "...",
    "type": "Survival",
    "needKey": "sleep",
    "needLabel": "Sleep",
    "needOrder": 1,
    "questionId": "507f1f77bcf86cd799439011",
    "isCompleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Get Goals
```
GET /api/goals?status=active
Authorization: Bearer {token}

Query Params:
- status: "active" | "completed" (optional)

Response:
{
  "success": true,
  "total": 5,
  "data": [
    {
      "_id": "...",
      "title": "Improve Sleep",
      "type": "Survival",
      "needKey": "sleep",
      "needLabel": "Sleep",
      "needOrder": 1,
      "questionId": "507f1f77bcf86cd799439011",
      "isCompleted": false,
      ...
    }
  ]
}
```

#### Get Goal by ID
```
GET /api/goals/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Improve Sleep",
    "type": "Survival",
    "needKey": "sleep",
    "needLabel": "Sleep",
    "needOrder": 1,
    "questionId": "507f1f77bcf86cd799439011",
    "isCompleted": false,
    ...
  }
}
```

#### Update Goal
```
PATCH /api/goals/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Title",  // Optional
  "description": "...",  // Optional
  "type": "Survival",  // Optional, must match needKey category if needKey provided
  "needKey": "exercise",  // NEW: Optional, can update or set to null
  "isCompleted": true  // Optional
}

Note:
- If needKey is updated, needLabel, needOrder, and questionId are auto-filled
- If needKey is updated and title not provided, title is auto-filled as "Improve {needLabel}"
- Setting needKey to null clears needLabel, needOrder, and questionId
- This automatically triggers achievement recalculation when isCompleted changes to true
```

#### Delete Goal
```
DELETE /api/goals/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

#### Get Coaching Offer Status
```
GET /api/auth/me
Authorization: Bearer {token}

Response includes:
{
  "user": {
    ...
    "coachingOfferEligible": true,
    "coachingOfferTriggeredAt": "2025-01-15T10:00:00Z",
    "completedGoalsCount": 3
  }
}
```

---

### Achievements

#### Get User Achievements
```
GET /api/achievements
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalPoints": 1500,
    "currentBadge": {
      "level": 2,
      "name": "Silver"
    },
    "focusStreak": 5,
    "lastActivityDate": "...",
    "activityCounts": {
      "assessmentsCompleted": 2,
      "goalsCompleted": 3,
      "reflectionsCreated": 10,
      "daysActive": 15
    },
    "unlockedAchievements": [...]
  }
}
```

---

### Reflections

#### Create Reflection (Linked to Question)
```
POST /api/reflections
Content-Type: application/json
Authorization: Bearer {token}

{
  "mood": "happy",
  "note": "Feeling great about my sleep improvement",
  "questionId": "...",  // Optional: link to specific question/need
  "date": "2025-01-15T10:00:00Z"  // Optional
}
```

---

## Implementation Guide

### Step 1: Assessment Flow Implementation

#### 1.1 Fetch Regular Questions (Section 1)
```javascript
async function fetchRegularQuestions() {
  const response = await fetch(
    `${API_BASE_URL}/api/questions?section=1&sectionType=regular`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data.data; // Array of regular questions
}
```

#### 1.2 For Each Regular Question, Fetch V & Q
```javascript
async function fetchVQQuestions(parentQuestionId) {
  const [vQuestions, qQuestions] = await Promise.all([
    fetch(`${API_BASE_URL}/api/questions?sectionType=V&parentQuestionId=${parentQuestionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch(`${API_BASE_URL}/api/questions?sectionType=Q&parentQuestionId=${parentQuestionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  ]);
  
  const vData = await vQuestions.json();
  const qData = await qQuestions.json();
  
  return {
    v: vData.data,
    q: qData.data
  };
}
```

#### 1.3 Submit Assessment
```javascript
async function submitAssessment(responses) {
  const response = await fetch(`${API_BASE_URL}/api/assessment/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ responses })
  });
  
  const data = await response.json();
  // data.needScores contains need-level scores
  // data.categoryScores contains category-level scores
  return data;
}
```

### Step 2: Report Implementation

#### 2.1 Fetch Need-Level Report (with Recommendations)
```javascript
async function fetchNeedsReport() {
  const response = await fetch(
    `${API_BASE_URL}/api/assessment/needs-report`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  // Returns: needScores (with questionId), lowestNeeds, recommendations, learningByNeed, etc.
  return data.data;
}
```

#### 2.2 Display Need-Level Sliders
```javascript
// Use needScores from report, NOT categoryScores
const { needScores } = await fetchNeedsReport();

// Render sliders for each need
needScores.forEach(need => {
  renderSlider({
    label: need.needLabel, // e.g., "Sleep", "Exercise"
    score: need.score,     // e.g., 5.5
    category: need.category, // e.g., "Survival"
    needKey: need.needKey   // e.g., "sleep"
  });
});
```

#### 2.3 Show Pyramid Visualization
```javascript
// Position needs on pyramid based on:
// 1. Category (bottom to top: Survival → Safety → Social → Self → Meta-Needs)
// 2. Score (left to right: low to high)
// Use needScores array to position each need
```

### Step 3: Learn & Grow Implementation

#### 3.1 Fetch Learning Content for a Need
```javascript
async function fetchLearningByNeed(needKey) {
  // First, get questionId for this need
  const questionsResponse = await fetch(
    `${API_BASE_URL}/api/questions?needKey=${needKey}&section=1&sectionType=regular&limit=1`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const questionsData = await questionsResponse.json();
  
  if (questionsData.data.length === 0) return null;
  
  const questionId = questionsData.data[0]._id;
  
  // Then get learning content
  const learningResponse = await fetch(
    `${API_BASE_URL}/api/question-learning/question/${questionId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const learningData = await learningResponse.json();
  
  return learningData.data;
}
```

#### 3.2 Display Learn & Grow Section
```javascript
// After assessment completion, show:
// 1. List of needs with learning content
// 2. Link to articles, videos, audio per need
// 3. Use needKey to fetch and display content

const needsReport = await fetchNeedsReport();
needsReport.needScores.forEach(need => {
  if (need.hasLearningContent) {
    const learning = await fetchLearningByNeed(need.needKey);
    displayLearningCard({
      need: need.needLabel,
      title: learning.title,
      content: learning.content,
      readTime: learning.readTimeMinutes,
      thumbnail: learning.thumbnailUrl
    });
  }
});
```

### Step 4: Recommendations & Goal Setting

#### 4.1 Fetch Needs Report (includes Recommendations)
```javascript
async function fetchNeedsReport() {
  const response = await fetch(
    `${API_BASE_URL}/api/assessment/needs-report`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  // data.recommendations - array of recommended actions
  // data.primaryNeed - lowest scoring need
  // data.needScores - all needs with questionIds
  return data.data;
}
```

#### 4.2 Display Recommendation Prompt
```javascript
const needsReport = await fetchNeedsReport();
const recommendations = needsReport.recommendations;

// Show prompt: "Which one of your needs would you like to develop more skills in?"
// Show options:
recommendations.forEach(action => {
  if (action.type === 'coach') {
    showButton('Ask your coach?', () => {
      // Navigate to coach contact or show coach options
    });
  }
  if (action.type === 'goal') {
    showButton('Set A Goal', () => {
      // Navigate to goal creation with pre-filled need and questionId
      navigateToGoalCreation(action.needKey, action.questionId);
    });
  }
  if (action.type === 'learn') {
    showButton('Learn & Grow', () => {
      // Show learning content for this need using questionId
      showLearningContent(action.questionId);
    });
  }
});
```

#### 4.3 Get Needs by Category (for Dropdown)
```javascript
async function getNeedsByCategory(category) {
  const response = await fetch(
    `${API_BASE_URL}/api/goals/needs/${category}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data.data; // Array of needs: [{ needKey, needLabel, needOrder, category }]
}
```

#### 4.4 Goal Creation UI Flow with Title Dropdown

**UI Pattern**: Title field should be a **Dropdown/Select** (not text input) that shows need labels.

```javascript
// React component example
function GoalForm() {
  const [category, setCategory] = useState('');
  const [needsList, setNeedsList] = useState([]);
  const [selectedNeedKey, setSelectedNeedKey] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Step 1: When category is selected
  const handleCategoryChange = async (selectedCategory) => {
    setCategory(selectedCategory);
    setSelectedNeedKey(''); // Clear previous selection
    setTitle(''); // Clear title
    
    // Fetch needs for this category
    const needs = await getNeedsByCategory(selectedCategory);
    setNeedsList(needs);
  };

  // Step 2: When need is selected from Title dropdown
  const handleTitleNeedSelect = (needKey) => {
    const selectedNeed = needsList.find(n => n.needKey === needKey);
    if (selectedNeed) {
      setSelectedNeedKey(needKey);
      // Auto-fill title as "Improve {needLabel}"
      setTitle(`Improve ${selectedNeed.needLabel}`);
    }
  };

  // Step 3: Submit goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const goalData = {
      type: category,
      title: title, // "Improve Sleep" (auto-filled)
      needKey: selectedNeedKey, // "sleep"
      description: description,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(goalData)
    });
    
    const result = await response.json();
    return result;
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Step 1: Category Selection */}
      <select 
        value={category} 
        onChange={(e) => handleCategoryChange(e.target.value)}
        required
      >
        <option value="">Select Category</option>
        <option value="Survival">Survival</option>
        <option value="Safety">Safety</option>
        <option value="Social">Social</option>
        <option value="Self">Self</option>
        <option value="Meta-Needs">Meta-Needs</option>
      </select>

      {/* Step 2: Title Dropdown (shows need labels) */}
      {category && (
        <select
          value={selectedNeedKey}
          onChange={(e) => handleTitleNeedSelect(e.target.value)}
          required
        >
          <option value="">Select Need (Title)</option>
          {needsList.map(need => (
            <option key={need.needKey} value={need.needKey}>
              {need.needLabel}
            </option>
          ))}
        </select>
      )}

      {/* Display auto-filled title */}
      {title && (
        <input 
          type="text" 
          value={title} 
          readOnly 
          placeholder="Title will be auto-filled"
        />
      )}

      {/* Other fields */}
      <textarea 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />

      <button type="submit">Create Goal</button>
    </form>
  );
}
```

**Key Points:**
- Title field is a **dropdown** showing need labels (not a text input)
- When category changes, Title dropdown updates with new needs
- When need is selected, title auto-fills as "Improve {needLabel}"
- Backend receives `needKey` and auto-fills `needLabel` and `needOrder`

### Step 5: Coaching Offer Implementation

#### 5.1 Check Coaching Offer Eligibility
```javascript
async function checkCoachingOffer() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  
  if (data.user.coachingOfferEligible) {
    showCoachingOffer({
      message: "Free coaching session valued at $500AUD",
      description: "You've completed 3 goals! Claim your free coaching session.",
      onClaim: () => {
        // Show time selection and request form
        showCoachingRequestForm();
      }
    });
  }
}
```

#### 5.2 Track Goal Completion
```javascript
async function markGoalCompleted(goalId) {
  const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      isCompleted: true
    })
  });
  
  // After marking complete, check if 3rd goal
  const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const userData = await userResponse.json();
  
  if (userData.user.completedGoalsCount === 3 && !userData.user.coachingOfferEligible) {
    // This should be automatic, but you can trigger a refresh
    // The backend sets coachingOfferEligible automatically
    checkCoachingOffer();
  }
}
```

### Step 6: Subscription & Access Control

#### 6.1 Filter Questions by Subscription
```javascript
// Backend automatically filters based on user's subscription
// Frontend should:
// 1. Get user's subscription type
// 2. Hide/disable categories not available
// 3. Show upgrade prompts for locked categories

const user = await fetchUser();
const availableCategories = {
  'Free': ['Survival', 'Safety'], // 2 categories
  'Premium': ['Survival', 'Safety', 'Social', 'Self'], // 4 categories (excludes Meta-Needs)
  'Plus': ['Survival', 'Safety', 'Social', 'Self'], // 4 categories (alias for Premium)
  'Coach': ['Survival', 'Safety', 'Social', 'Self', 'Meta-Needs'], // All 5 categories
  'Pro': ['Survival', 'Safety', 'Social', 'Self', 'Meta-Needs'] // All 5 categories (alias for Coach)
}[user.currentSubscriptionType];

// Only show questions from availableCategories
```

#### 6.2 Handle Subscription Restrictions
```javascript
// When user tries to access restricted category:
if (!availableCategories.includes(selectedCategory)) {
  showUpgradePrompt({
    message: `Upgrade to ${getRequiredPlan(selectedCategory)} to access ${selectedCategory} category`,
    onUpgrade: () => navigateToSubscription()
  });
}
```

---

## UI/UX Requirements

### Assessment Page

1. **Question Display**
   - Show Regular questions first (Section 1)
   - After each Regular question, show its V question, then Q question
   - Group by category visually
   - Show progress indicator

2. **Answer Options**
   - Use 1-7 scale sliders or buttons
   - Label: "1 - Not at all true" to "7 - Completely true"
   - Save answers as user progresses

### Report Page

1. **Pyramid Visualization**
   - Show pyramid image (from client documentation)
   - Position needs on pyramid:
     - Vertical: Category level (Survival at bottom, Meta-Needs at top)
     - Horizontal: Score level (left = low, right = high)
   - Color-code by performance bands

2. **Need-Level Sliders** (NOT Category Sliders)
   - Show slider for each need (Sleep, Exercise, Food, Money, etc.)
   - Display need label and score
   - Group by category visually but show individual needs
   - Click on need to see details or learning content

3. **Performance Bands**
   - Dysfunctional/Extreme: 1-2 (Red)
   - Getting By: 3-4 (Yellow)
   - Thriving: 5-6 (Green)
   - Maximizing: 7 (Dark Green)

### Learn & Grow Page

1. **Content Display**
   - Show learning content organized by need
   - Display: Title, thumbnail, read time, content preview
   - Link to full article/video/audio
   - Filter by need or category

2. **Content Types**
   - Articles (text content)
   - Videos (video player)
   - Audio (audio player)
   - All linked to specific needs

### Recommendations Page

1. **Prompt Display**
   - "Which one of your needs would you like to develop more skills in?"
   - Show list of needs with scores
   - Highlight lowest needs

2. **Action Buttons**
   - "Ask your coach?" → Coach contact/booking
   - "Set A Goal" → Goal creation with need pre-filled
   - "Learn & Grow" → Show learning content for need

### Goal Setting Page

1. **Category Selection (Type Field)**
   - User selects category/type: "Survival", "Safety", "Social", "Self", or "Meta-Needs"
   - Category dropdown uses same values as assessment categories
   - This is the first field user interacts with

2. **Title Field with Need Labels Dropdown (NEW)**
   - **Important**: The Title input field should be a **Dropdown/Select** (not a text input)
   - When category is selected, fetch needs for that category: `GET /api/goals/needs/{category}`
   - Populate the Title dropdown with need labels from that category
   - Example for "Survival" category: Title dropdown shows ["Sleep", "Exercise", "Food", "Money", ...]
   - When user selects a need label from Title dropdown:
     - Auto-fill title as "Improve {needLabel}" (e.g., "Improve Sleep")
     - Store the corresponding needKey, needLabel, needOrder internally
   - **If user changes category**: 
     - Clear the Title dropdown selection
     - Fetch new needs for the new category: `GET /api/goals/needs/{newCategory}`
     - Update Title dropdown with new need labels
     - User must select a need from the new category

3. **Goal Form Fields**
   - **Category/Type**: Dropdown with ["Survival", "Safety", "Social", "Self", "Meta-Needs"]
   - **Title**: Dropdown/Select field showing need labels (populated based on selected category)
     - When need selected, title becomes "Improve {needLabel}"
     - User can see all available needs for the selected category
   - **Description**: Text input (optional)
   - **Start/End dates**: Date pickers

4. **Implementation Example**
```javascript
// State management
const [selectedCategory, setSelectedCategory] = useState(null);
const [needsList, setNeedsList] = useState([]);
const [selectedNeed, setSelectedNeed] = useState(null);

// When category changes
const handleCategoryChange = async (category) => {
  setSelectedCategory(category);
  setSelectedNeed(null); // Clear previous selection
  
  // Fetch needs for this category
  const needs = await getNeedsByCategory(category);
  setNeedsList(needs);
};

// When need is selected from Title dropdown
const handleNeedSelect = (needKey) => {
  const need = needsList.find(n => n.needKey === needKey);
  setSelectedNeed(need);
  // Title is auto-filled as "Improve {need.needLabel}"
  setTitle(`Improve ${need.needLabel}`);
};

// On form submit
const handleSubmit = async () => {
  await createGoal({
    type: selectedCategory,
    title: title, // "Improve Sleep"
    needKey: selectedNeed.needKey, // "sleep"
    // needLabel and needOrder are auto-filled by backend
    description,
    startDate,
    endDate
  });
};
```

5. **After Goal Creation**
   - Show Learn & Grow content for that need
   - Link to relevant articles/videos/audio
   - Goal response includes needKey, needLabel, needOrder for display

### Coaching Offer Modal

1. **Trigger**
   - Show after 3rd goal completion
   - Persistent until claimed or dismissed

2. **Content**
   - "Free coaching session valued at $500AUD"
   - Description of offer
   - Time selection (e.g., "1pm")
   - Request button

3. **After Claim**
   - Show confirmation
   - Display Zoom link (when provided by backend)
   - Add to calendar option

---

## Subscription & Access Control

### Subscription Tiers

| Plan | Categories | Price |
|------|-----------|-------|
| Free | Survival, Safety | $0 |
| Plus/Premium | Free + Social, Self | $19 |
| Pro/Coach | All (including Meta-Needs) | $39 |

### Implementation

```javascript
// Check category access
function canAccessCategory(category, subscriptionType) {
  const accessMap = {
    'Free': ['Survival', 'Safety'],
    'Premium': ['Survival', 'Safety', 'Social', 'Self'],
    'Plus': ['Survival', 'Safety', 'Social', 'Self'], // Alias for Premium
    'Coach': ['Survival', 'Safety', 'Social', 'Self', 'Meta-Needs'],
    'Pro': ['Survival', 'Safety', 'Social', 'Self', 'Meta-Needs'] // Alias for Coach
  };
  
  return accessMap[subscriptionType]?.includes(category) || false;
}

// Filter questions by subscription
function filterQuestionsBySubscription(questions, subscriptionType) {
  return questions.filter(q => canAccessCategory(q.category, subscriptionType));
}

// Show upgrade prompt
function showUpgradePrompt(requiredCategory) {
  const requiredPlan = {
    'Social': 'Plus',
    'Self': 'Plus',
    'Meta-Needs': 'Pro'
  }[requiredCategory];
  
  // Show upgrade modal
}
```

---

## Error Handling

### Standard Error Format

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "..." // Only in development
}
```

### Common Errors

1. **401 Unauthorized**
   - Token missing or expired
   - Redirect to login

2. **403 Forbidden**
   - Category not available for subscription
   - Show upgrade prompt

3. **400 Bad Request**
   - Validation error
   - Show error message to user

4. **404 Not Found**
   - Resource doesn't exist
   - Show friendly error message

### Error Handling Example

```javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 403) {
        // Subscription restriction
        showUpgradePrompt(data.error);
        return;
      }
      
      // Other errors
      throw new Error(data.error || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    showErrorMessage(error.message);
    throw error;
  }
}
```

---

## Testing Checklist

### Assessment Flow
- [ ] Can fetch regular questions (Section 1)
- [ ] Can fetch V questions for each regular question
- [ ] Can fetch Q questions for each regular question
- [ ] Can submit assessment with all responses
- [ ] Need scores are calculated correctly
- [ ] Category scores are calculated correctly

### Report Display
- [ ] Need-level sliders display (NOT category sliders)
- [ ] Pyramid visualization shows needs correctly positioned
- [ ] Performance bands are color-coded correctly
- [ ] Can click on need to see details

### Learn & Grow
- [ ] Can fetch learning content by question ID
- [ ] Can fetch learning content by need key
- [ ] Content displays correctly (articles, videos, audio)
- [ ] Content is linked to correct needs

### Recommendations
- [ ] Recommendations endpoint returns correct data
- [ ] "Ask your coach?" button works
- [ ] "Set A Goal" button pre-fills need
- [ ] "Learn & Grow" shows correct content

### Goal Management
- [ ] Can create goal with need context
- [ ] Can mark goal as completed
- [ ] Achievement recalculation triggers automatically
- [ ] Coaching offer appears after 3rd goal

### Subscription
- [ ] Free plan only shows Survival/Safety
- [ ] Plus plan shows Social/Self
- [ ] Pro plan shows all categories including Meta-Needs
- [ ] Upgrade prompts show for restricted categories

### Error Handling
- [ ] 401 errors redirect to login
- [ ] 403 errors show upgrade prompt
- [ ] 400 errors show validation messages
- [ ] Network errors are handled gracefully

---

## Base URLs

- **Production**: `https://self-actualization-analysis-two.vercel.app`
- **Development**: `http://localhost:5000` (or your local port)

## Authentication

Include token in all authenticated requests:
```
Authorization: Bearer {token}
```

Store token securely (e.g., localStorage, httpOnly cookie) and refresh when expired.

---

## Questions?

If you need clarification on any aspect of this guide, please contact the backend development team.

**Last Updated**: January 2025
**Version**: 2.0
