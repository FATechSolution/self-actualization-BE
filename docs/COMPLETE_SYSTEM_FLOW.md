# Complete System Flow & Integration Guide

## 📋 Table of Contents
1. [System Overview & Purpose](#system-overview--purpose)
2. [Maslow's Hierarchy Structure](#maslows-hierarchy-structure)
3. [Complete Assessment Flow](#complete-assessment-flow)
4. [Question Categories & Sections](#question-categories--sections)
5. [V/Q Question Flow Integration](#vq-question-flow-integration)
6. [Learning Content Integration](#learning-content-integration)
7. [Reflection Integration](#reflection-integration)
8. [Complete User Journey](#complete-user-journey)

---

## System Overview & Purpose

### What This System Does
This is a **Self-Actualization Assessment System** based on **Maslow's Hierarchy of Needs**. It helps users:
1. Assess their current state across 5 need levels
2. Understand their scores through a pyramid visualization
3. Learn about health/vitality aspects of each question
4. Track progress through goals and reflections
5. Build streaks and earn achievements

### Core Concept
Users answer questions (1-7 scale) that map to Maslow's 5 need categories. The system calculates scores per category and shows where they are on their self-actualization journey.

---

## Maslow's Hierarchy Structure

### The 5 Categories (Bottom to Top)

```
┌─────────────────────────────────────┐
│   Meta-Needs (Top)                  │  Purpose, creativity, contribution
├─────────────────────────────────────┤
│   Self                              │  Confidence, respect, achievement
├─────────────────────────────────────┤
│   Social                            │  Belonging, love, relationships
├─────────────────────────────────────┤
│   Safety                            │  Stability, financial security
├─────────────────────────────────────┤
│   Survival (Bottom)                 │  Physical needs, health, energy
└─────────────────────────────────────┘
```

### Category Details
- **Survival**: Physical needs, health, energy, rest, nutrition
- **Safety**: Stability, financial security, sense of control
- **Social**: Belonging, love, connection, relationships
- **Self**: Confidence, respect, personal achievement
- **Meta-Needs**: Purpose, creativity, contribution, self-actualization

### Subscription Access
- **Free Plan**: Survival, Safety (bottom 2 levels)
- **Premium Plan**: Survival, Safety, Social, Self (4 categories, excludes Meta-Needs)
- **Coach Plan**: All 5 categories (full pyramid)

---

## Complete Assessment Flow

### Phase 1: First Section (Regular Questions)

**Purpose**: Get baseline scores for each category

**Flow**:
1. User starts assessment
2. System fetches questions: `GET /api/questions?section=1&sectionType=regular`
3. Questions are organized by category (Survival → Safety → Social → Self → Meta-Needs)
4. User answers each question (1-7 scale)
5. After completing first section, user can:
   - **Learn about each question** (Requirement #9)
   - **Move to V section** (Requirement #22)

**API Call**:
```
GET /api/questions?section=1&sectionType=regular&categories=Survival,Safety,Social,Self,Meta-Needs
```

**Response Structure**:
```json
{
  "data": [
    {
      "_id": "q1",
      "questionText": "I have enough food and water...",
      "category": "Survival",
      "section": 1,
      "sectionType": "regular",
      "answerOptions": ["1 - Not at all", ..., "7 - Completely true"]
    },
    {
      "_id": "q2",
      "questionText": "I feel financially secure...",
      "category": "Safety",
      "section": 1,
      "sectionType": "regular"
    }
    // ... more questions
  ]
}
```

**After Submission**:
- User submits: `POST /api/assessment/submit`
- System calculates category scores (average of responses per category)
- Returns: `categoryScores: { Survival: 5.2, Safety: 4.8, ... }`
- User sees results on Review Results page (pyramid with sliders)

---

### Phase 2: V Section (Vitality Questions)

**Purpose**: Deep dive into "Vitality" aspects of Section 1 questions

**Flow**:
1. After Section 1 completion, for EACH question answered:
2. System fetches V questions: `GET /api/questions?section=2&sectionType=V&parentQuestionId=<questionId>`
3. These questions explore the "vitality" or "life force" aspects related to that specific Section 1 question
4. User answers V questions for each Section 1 question

**Example**:
```
Section 1 Question (Survival): "I have enough food and water"
  ↓
V Questions for this question:
  - "How energized do you feel after eating?"
  - "How does your nutrition affect your daily energy?"
  - "How vital do you feel in your physical body?"
```

**API Call**:
```
GET /api/questions?section=2&sectionType=V&parentQuestionId=q1
```

**Response**:
```json
{
  "data": [
    {
      "_id": "v1",
      "questionText": "How energized do you feel after eating?",
      "category": "Survival",  // Same category as parent
      "section": 2,
      "sectionType": "V",
      "parentQuestionId": "q1"  // Links to Section 1 question
    }
  ]
}
```

**Key Point**: V questions maintain the SAME category as their parent question. They're just exploring the "vitality" dimension.

---

### Phase 3: Q Section (Quality Questions)

**Purpose**: Assess the "Quality" of responses from Section 1

**Flow**:
1. After V section, system fetches Q questions
2. These questions assess the quality/depth of Section 1 responses
3. User answers Q questions

**API Call**:
```
GET /api/questions?section=3&sectionType=Q&parentQuestionId=<questionId>
```

**Example**:
```
Section 1 Question: "I have enough food and water"
  ↓
Q Questions:
  - "How satisfied are you with the quality of your nutrition?"
  - "How well does your current diet support your goals?"
```

**Key Point**: Q questions also maintain the same category as their parent question.

---

## Question Categories & Sections

### How Categories Work with Sections

**Important**: Categories (Survival, Safety, etc.) are INDEPENDENT of sections (1, 2, 3).

- **Category** = Which level of Maslow's pyramid (Survival, Safety, Social, Self, Meta-Needs)
- **Section** = Which phase of assessment (1 = Regular, 2 = V, 3 = Q)
- **Section Type** = Type of question (regular, V, Q)

### Example Structure

```
Category: Survival
├── Section 1 (Regular)
│   ├── Question: "I have enough food and water"
│   └── Question: "I get adequate sleep"
│
├── Section 2 (V - Vitality)
│   ├── V Question for "I have enough food" → parentQuestionId: q1
│   └── V Question for "I get adequate sleep" → parentQuestionId: q2
│
└── Section 3 (Q - Quality)
    ├── Q Question for "I have enough food" → parentQuestionId: q1
    └── Q Question for "I get adequate sleep" → parentQuestionId: q2
```

### Navigation Flow

```
1. Get all Section 1 questions by category:
   GET /api/questions?section=1&sectionType=regular&categories=Survival

2. User answers Section 1 questions

3. For EACH answered question, get V questions:
   GET /api/questions?section=2&sectionType=V&parentQuestionId=<answeredQuestionId>

4. User answers V questions

5. For EACH Section 1 question, get Q questions:
   GET /api/questions?section=3&sectionType=Q&parentQuestionId=<answeredQuestionId>

6. User answers Q questions

7. Submit all responses (Section 1 + V + Q)
```

---

## V/Q Question Flow Integration

### How V/Q Questions Link to Categories

**Key Understanding**: 
- V and Q questions **inherit the category** from their parent Section 1 question
- If Section 1 question is "Survival", all its V/Q questions are also "Survival"
- This maintains the pyramid structure

### Complete Flow Example

**Step 1: Section 1 - Survival Category**
```
Question ID: q1
Category: Survival
Section: 1
Section Type: regular
Question: "I have enough food and water"
User Answer: 6
```

**Step 2: V Section - For q1**
```
Question ID: v1
Category: Survival (inherited from q1)
Section: 2
Section Type: V
Parent Question ID: q1
Question: "How energized do you feel after eating?"
User Answer: 5
```

**Step 3: Q Section - For q1**
```
Question ID: q1_quality
Category: Survival (inherited from q1)
Section: 3
Section Type: Q
Parent Question ID: q1
Question: "How satisfied are you with nutrition quality?"
User Answer: 4
```

### Category Score Calculation

**All responses (Section 1 + V + Q) for the same category contribute to that category's score:**

```
Survival Category:
- Section 1 responses: [6, 5, 7] → Average: 6.0
- V responses: [5, 6] → Average: 5.5
- Q responses: [4, 5] → Average: 4.5
- Overall Survival Score: (6.0 + 5.5 + 4.5) / 3 = 5.33
```

**OR** (depending on business logic):
- Only Section 1 counts toward category scores
- V/Q are for deeper understanding only

---

## Learning Content Integration

### Purpose
After completing Section 1, users can learn about health/vitality aspects of each question they answered.

### How It Works

**Step 1: User completes Section 1 question**
```
Question ID: q1
Category: Survival
Question: "I have enough food and water"
```

**Step 2: User clicks "Learn More" or "Learn About This Question"**
```
API Call: GET /api/question-learning/question/q1
```

**Step 3: System returns learning content**
```json
{
  "data": {
    "_id": "learning1",
    "questionId": {
      "_id": "q1",
      "questionText": "I have enough food and water",
      "category": "Survival"
    },
    "title": "Understanding Nutrition & Vitality",
    "content": "This question explores your basic survival needs...",
    "learningType": "health",  // or "vitality" or "general"
    "readTimeMinutes": 5
  }
}
```

### Learning Content by Category

**Each question can have learning content, organized by:**
- **Category**: Survival, Safety, Social, Self, Meta-Needs
- **Learning Type**: health, vitality, general

**Example Structure**:
```
Survival Category Questions:
├── Question 1: "I have enough food"
│   └── Learning Content: "Nutrition & Health Basics"
│
├── Question 2: "I get adequate sleep"
│   └── Learning Content: "Sleep & Energy Management"
│
└── Question 3: "I have access to healthcare"
    └── Learning Content: "Healthcare & Wellness"
```

### When to Show Learning Content

**Requirement #9**: "After completing the first section of questions, there needs to be the option to learn about each of the questions"

**Flow**:
1. User completes Section 1
2. On results page or question review page
3. Show "Learn More" button for each question
4. Clicking opens learning content modal/page
5. Display: title, content, learningType, readTime

---

## Reflection Integration

### Purpose
Users can create daily reflections linked to specific questions they answered.

### How It Works

**Step 1: User answers a question**
```
Question ID: q1
Category: Survival
User Answer: 6
```

**Step 2: User creates reflection for this question**
```
API Call: POST /api/reflections
{
  "mood": "happy",
  "note": "Feeling energized today after good nutrition",
  "questionId": "q1",  // Links reflection to the question
  "date": "2025-01-15"
}
```

**Step 3: Reflection is saved with question link**
```json
{
  "_id": "reflection1",
  "userId": "user1",
  "questionId": "q1",  // Linked to question
  "mood": "happy",
  "note": "...",
  "date": "2025-01-15"
}
```

### Reflection by Category

**Reflections can be filtered by question category:**

```
User's Reflections:
├── Survival Category Reflections
│   ├── Reflection for "I have enough food" question
│   └── Reflection for "I get adequate sleep" question
│
├── Safety Category Reflections
│   └── Reflection for "I feel financially secure" question
│
└── Social Category Reflections
    └── Reflection for "I have strong relationships" question
```

### Use Cases

1. **Daily Reflection**: User reflects on how a specific question's answer relates to their day
2. **Progress Tracking**: Track mood/notes related to specific need categories
3. **Category Analysis**: See all reflections for a specific category (Survival, Safety, etc.)

---

## Complete User Journey

### Full Flow with All Requirements

#### **Step 1: User Registration/Login**
```
POST /api/auth/register
POST /api/auth/login
→ Get authToken
```

#### **Step 2: Good Morning Screen**
- Shows 2 tabs with instructions
- Tab 1: Continue assessment
- Tab 2: Continue self-assessment
- Link to goals page

#### **Step 3: Start Assessment - Section 1**

**3a. Get Questions**
```
GET /api/questions?section=1&sectionType=regular
→ Returns questions organized by category
```

**3b. Display Questions**
- Show questions sequentially
- Rating key BEFORE question (Requirement #1)
- Instructions at top of page (Requirement #6)

**3c. User Answers Questions**
- Answer each question (1-7 scale)
- Questions grouped by category (Survival → Safety → Social → Self → Meta-Needs)

**3d. After Each Question (or After Section)**
- Show "Learn About This Question" option (Requirement #9)
- API: `GET /api/question-learning/question/<questionId>`
- Display health/vitality learning content

**3e. Submit Section 1**
```
POST /api/assessment/submit
{
  "responses": [
    { "questionId": "q1", "selectedOption": 6 },
    { "questionId": "q2", "selectedOption": 5 },
    ...
  ]
}
→ Returns categoryScores, overallScore
```

#### **Step 4: Review Results Page**

**4a. Display Pyramid**
- Show pyramid with category scores (Requirement #7)
- Sliders on pyramid showing scores
- Instructions on what pyramid means (Requirement #2, #3)
- Hierarchy levels labeled (Survival at bottom, etc.) (Requirement #3)

**4b. Needs Breakdown**
- Show category scores with instructions (Requirement #4)
- Explain what each category means

**4c. Share to Coach**
- Button links to: `mailto:info@thecoachingcentre.com.au` (Requirement #5)

**4d. PDF Download**
- Instructions on how to read PDF (Requirement #3)
- Show hierarchy levels in PDF

#### **Step 5: V Section Questions**

**5a. For Each Section 1 Question**
```
GET /api/questions?section=2&sectionType=V&parentQuestionId=<questionId>
→ Returns V (Vitality) questions for that specific question
```

**5b. User Answers V Questions**
- Questions explore vitality aspects
- Maintains same category as parent question

**5c. Submit V Responses**
```
POST /api/assessment/submit
{
  "responses": [
    // Section 1 responses
    { "questionId": "q1", "selectedOption": 6 },
    // V section responses
    { "questionId": "v1", "selectedOption": 5 },
    { "questionId": "v2", "selectedOption": 6 },
    ...
  ]
}
```

#### **Step 6: Q Section Questions**

**6a. For Each Section 1 Question**
```
GET /api/questions?section=3&sectionType=Q&parentQuestionId=<questionId>
→ Returns Q (Quality) questions
```

**6b. User Answers Q Questions**
- Questions assess quality of responses
- Maintains same category as parent

**6c. Submit All Responses**
- Final submission includes Section 1 + V + Q

#### **Step 7: Daily Reflections**

**7a. Create Reflection Linked to Question**
```
POST /api/reflections
{
  "mood": "happy",
  "note": "Feeling great about nutrition today",
  "questionId": "q1",  // Links to specific question
  "date": "2025-01-15"
}
```

**7b. Save Button Works** (Requirement #20)
- Save reflection
- Navigate back or to next reflection
- Show success message

**7c. View Reflections by Category**
- Filter reflections by question category
- See all Survival reflections, Safety reflections, etc.

#### **Step 8: Goals**

**8a. Create Goal**
```
POST /api/goals
{
  "title": "Improve Nutrition",
  "description": "Eat healthier meals",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "type": "Health"
}
→ Returns goal with success message
```

**8b. Save Button Works** (Requirement #12)
- Save goal
- Return to goal tracker page
- Show updated goals list

**8c. Mark Goal as Completed**
```
PATCH /api/goals/:id
{
  "isCompleted": true
}
→ Automatically triggers achievement recalculation
```

**8d. View Goals on Tracker**
- Goal tracker page shows all goals (Requirement #19)
- Arrow is prominent and clickable (Requirement #11)

#### **Step 9: Achievements & Activity**

**9a. View Achievements**
```
GET /api/achievements
→ Returns points, badges, focusStreak, activityCounts
```

**9b. Focus Streak Box Works** (Requirement #21)
```
GET /api/achievements/streak
→ Returns focusStreak, lastActivityDate, streakAchievements
→ Display in activity page
```

**9c. Points & Badges**
- Points awarded for: assessments, completed goals, reflections
- Badges unlock based on points
- Display on activity page

#### **Step 10: Profile**

**10a. Upload Profile Image** (Requirement #14)
```
POST /api/auth/profile/avatar
Content-Type: multipart/form-data
Body: { avatar: <image file> }
→ Updates user avatar
```

---

## Key Integration Points

### 1. Questions → Categories → Sections

```
Question Structure:
├── Category (Survival, Safety, Social, Self, Meta-Needs)
├── Section (1, 2, 3)
├── Section Type (regular, V, Q)
└── Parent Question (for V/Q questions)
```

### 2. Assessment → Category Scores → Pyramid

```
User Answers Questions
  ↓
System Calculates Category Scores
  ↓
Display on Pyramid (Review Results Page)
  ↓
Show Sliders for Each Category
```

### 3. Questions → Learning Content

```
Each Question Can Have Learning Content
  ↓
Organized by Category
  ↓
Learning Type: health, vitality, general
  ↓
Shown After Section 1 Completion
```

### 4. Questions → Reflections

```
User Answers Question
  ↓
User Creates Reflection
  ↓
Link Reflection to Question (questionId)
  ↓
Reflections Grouped by Category
```

### 5. Goals → Achievements

```
User Completes Goal
  ↓
System Auto-Recalculates Achievements
  ↓
Points, Badges, Streaks Updated
  ↓
Display on Activity Page
```

---

## API Endpoint Summary

### Questions
- `GET /api/questions?section=1&sectionType=regular` - Section 1 questions
- `GET /api/questions?section=2&sectionType=V&parentQuestionId=<id>` - V questions
- `GET /api/questions?section=3&sectionType=Q&parentQuestionId=<id>` - Q questions

### Learning Content
- `GET /api/question-learning/question/<questionId>` - Get learning for question
- `GET /api/question-learning?category=Survival` - Get all learning for category

### Reflections
- `POST /api/reflections` - Create reflection with questionId
- `GET /api/reflections?questionId=<id>` - Get reflections for question

### Assessment
- `POST /api/assessment/submit` - Submit all responses
- `GET /api/assessment/result` - Get latest results with category scores

### Goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal (triggers achievement recalculation)

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/streak` - Get focus streak details

---

## Frontend Implementation Guide

### 1. Assessment Flow Screen
```javascript
// Step 1: Get Section 1 questions
const questions = await fetch('/api/questions?section=1&sectionType=regular');

// Step 2: After each question, show "Learn More" button
const learning = await fetch(`/api/question-learning/question/${questionId}`);

// Step 3: After Section 1, get V questions for each answered question
const vQuestions = await fetch(`/api/questions?section=2&sectionType=V&parentQuestionId=${questionId}`);

// Step 4: Get Q questions
const qQuestions = await fetch(`/api/questions?section=3&sectionType=Q&parentQuestionId=${questionId}`);
```

### 2. Review Results Page
```javascript
// Get assessment results
const results = await fetch('/api/assessment/result');
// results.data.categoryScores = { Survival: 5.2, Safety: 4.8, ... }

// Display pyramid with sliders
// Each category = one level of pyramid
// Slider position = category score (1-7)
```

### 3. Reflection Screen
```javascript
// Create reflection linked to question
await fetch('/api/reflections', {
  method: 'POST',
  body: JSON.stringify({
    mood: 'happy',
    note: '...',
    questionId: currentQuestionId  // Link to question
  })
});
```

### 4. Activity Page
```javascript
// Get focus streak
const streak = await fetch('/api/achievements/streak');
// Display: streak.data.focusStreak, streak.data.streakAchievements
```

---

## Summary

### System Purpose
Help users assess and improve their self-actualization journey through Maslow's hierarchy of needs.

### Key Flows
1. **Assessment**: Section 1 → V Section → Q Section (all linked by categories)
2. **Learning**: Each question has health/vitality learning content
3. **Reflection**: Daily reflections linked to specific questions
4. **Progress**: Goals → Achievements → Streaks

### Category Integration
- All questions belong to a category (Survival, Safety, Social, Self, Meta-Needs)
- V/Q questions inherit category from parent Section 1 question
- Learning content organized by category
- Reflections can be filtered by category
- Category scores displayed on pyramid

### New Requirements Integration
- ✅ Reflections linked to questions (questionId field)
- ✅ V/Q question flow (section metadata)
- ✅ Learning content per question
- ✅ Focus streak calculation
- ✅ Goal completion → achievements
- ✅ Profile image upload

All features work together within the existing category-based pyramid structure!

