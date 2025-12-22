# Frontend Developer - Complete System Update Guide

## 📋 Overview

This document covers **all recent updates** to the Self-Actualization assessment system. Read this guide to understand what changed and what you need to implement on the frontend.

---

## 🆕 What's New in the System

### 1. **Quality & Volume Sub-Questions** (Major Update)
- Each main question now has **Quality** and **Volume** sub-questions
- Sub-questions have **customized rating options** (not generic 1-7 scale)
- Total: **42 questions** now (was 41)

### 2. **New Sex Question Added**
- New question: "My sexual life is healthy and fulfilling"
- Category: Survival
- Has Quality and Volume sub-questions

### 3. **New Learning Articles Added**
- **Sleep Article:** "UNLEASHING YOUR SLEEP POTENTIAL"
- **Sex Article:** "SEX ISN'T WHAT YOU THINK IT IS"
- Both articles are in the Learn & Grow library

---

## 📊 Summary of Changes

| What Changed | Before | After |
|-------------|--------|-------|
| **Questions** | 41 questions | 42 questions (added Sex) |
| **Sub-Questions** | Generic V/Q questions | Custom Quality/Volume sub-questions |
| **Rating Options** | Same for all: "1 - Not at all true" to "7 - Completely true" | Custom per need (e.g., "1 = Extremely poor" for sleep) |
| **Assessment Submission** | Only main rating | Main + Quality + Volume ratings |
| **Learning Articles** | Existing articles | Added Sleep + Sex articles |

---

## 🔄 Part 1: Quality & Volume Sub-Questions

### What Changed in Backend

**Before:**
- Questions had generic V (Vitality) and Q (Quality) sub-questions
- All used same rating scale: "1 - Not at all true" to "7 - Completely true"

**After:**
- Questions have **Quality** and **Volume** sub-questions embedded
- Each sub-question has **custom rating options** specific to that need
- Example: Sleep quality has different options than Food quality

### New Question Structure

When you fetch questions from `GET /api/questions`, each question now includes:

```javascript
{
  _id: "60d5ec49f1b2c8b5f8e4e5a1",
  questionText: "I get 7-8 hours of quality, restorative sleep most nights",
  category: "Survival",
  sectionType: "regular",
  
  // NEW: Quality sub-question
  qualitySubQuestion: {
    questionText: "How would you rate the quality of your sleep last night?",
    ratingOptions: [
      "1 = Extremely poor (restless, frequently waking, unrefreshing)",
      "2 = Very poor (significant disruption, feeling exhausted)",
      "3 = Poor (some disruption, tired upon waking)",
      "4 = Below average (moderate quality, somewhat rested)",
      "5 = Average (decent sleep, adequately rested)",
      "6 = Good (solid sleep, feeling refreshed)",
      "7 = Excellent (deep, restorative sleep, energized upon waking)"
    ]
  },
  
  // NEW: Volume sub-question
  volumeSubQuestion: {
    questionText: "How many hours of sleep did you get last night?",
    ratingOptions: [
      "1 = Less than 4 hours",
      "2 = 4-5 hours",
      "3 = 5-6 hours",
      "4 = 6-7 hours",
      "5 = 7-8 hours",
      "6 = 8-9 hours",
      "7 = 9+ hours"
    ]
  }
}
```

### What You Need to Change

#### 1. Update Question Display Component

**Before:**
```javascript
<QuestionCard 
  question={question.questionText}
  rating={selectedRating}
  onRatingChange={handleRatingChange}
/>
```

**After:**
```javascript
<QuestionCard 
  question={question.questionText}
  rating={selectedRating}
  onRatingChange={handleRatingChange}
  
  // NEW: Quality sub-question
  qualitySubQuestion={question.qualitySubQuestion}
  qualityRating={qualityRating}
  onQualityRatingChange={handleQualityRatingChange}
  
  // NEW: Volume sub-question
  volumeSubQuestion={question.volumeSubQuestion}
  volumeRating={volumeRating}
  onVolumeRatingChange={handleVolumeRatingChange}
/>
```

#### 2. Update State Management

```javascript
// React Example
const [mainRatings, setMainRatings] = useState({});
const [qualityRatings, setQualityRatings] = useState({});  // NEW
const [volumeRatings, setVolumeRatings] = useState({});    // NEW

// Handlers
const handleMainRating = (questionId, rating) => {
  setMainRatings(prev => ({ ...prev, [questionId]: rating }));
};

const handleQualityRating = (questionId, rating) => {
  setQualityRatings(prev => ({ ...prev, [questionId]: rating }));
};

const handleVolumeRating = (questionId, rating) => {
  setVolumeRatings(prev => ({ ...prev, [questionId]: rating }));
};
```

#### 3. Create Custom Rating Selector Component

**⚠️ IMPORTANT:** Quality/Volume sub-questions use **CUSTOM rating options**, not generic 1-7!

```jsx
function CustomRatingSelector({ value, onChange, options }) {
  return (
    <div className="custom-rating-selector">
      {options.map((option, index) => {
        const ratingValue = index + 1; // 1-7
        const isSelected = value === ratingValue;
        
        return (
          <button
            key={ratingValue}
            type="button"
            className={`rating-option ${isSelected ? 'selected' : ''}`}
            onClick={() => onChange(ratingValue)}
          >
            <span className="rating-number">{ratingValue}</span>
            <span className="rating-description">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
```

**Alternative: Dropdown**
```jsx
function CustomRatingDropdown({ value, onChange, options }) {
  return (
    <select 
      value={value || ''} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="custom-rating-dropdown"
    >
      <option value="">Select rating...</option>
      {options.map((option, index) => {
        const ratingValue = index + 1;
        return (
          <option key={ratingValue} value={ratingValue}>
            {option}
          </option>
        );
      })}
    </select>
  );
}
```

#### 4. Update Question Component

```jsx
function QuestionCard({ question, onMainRating, onQualityRating, onVolumeRating }) {
  const [mainRating, setMainRating] = useState(null);
  const [qualityRating, setQualityRating] = useState(null);
  const [volumeRating, setVolumeRating] = useState(null);

  return (
    <div className="question-card">
      {/* Main Question */}
      <div className="main-question">
        <h3>{question.questionText}</h3>
        <RatingSlider
          value={mainRating}
          onChange={(value) => {
            setMainRating(value);
            onMainRating(question._id, value);
          }}
          options={question.answerOptions} // Standard 1-7 options
        />
      </div>

      {/* Quality Sub-Question */}
      {question.qualitySubQuestion && (
        <div className="quality-sub-question">
          <h4>{question.qualitySubQuestion.questionText}</h4>
          <CustomRatingSelector
            value={qualityRating}
            onChange={(value) => {
              setQualityRating(value);
              onQualityRating(question._id, value);
            }}
            options={question.qualitySubQuestion.ratingOptions} // Custom options!
          />
        </div>
      )}

      {/* Volume Sub-Question */}
      {question.volumeSubQuestion && (
        <div className="volume-sub-question">
          <h4>{question.volumeSubQuestion.questionText}</h4>
          <CustomRatingSelector
            value={volumeRating}
            onChange={(value) => {
              setVolumeRating(value);
              onVolumeRating(question._id, value);
            }}
            options={question.volumeSubQuestion.ratingOptions} // Custom options!
          />
        </div>
      )}
    </div>
  );
}
```

#### 5. Update Assessment Submission

**Before:**
```javascript
const responses = questions.map(q => ({
  questionId: q._id,
  selectedOption: ratings[q._id]
}));
```

**After:**
```javascript
const responses = questions.map(q => {
  const response = {
    questionId: q._id,
    selectedOption: mainRatings[q._id], // Required
  };

  // Add quality response if provided (optional)
  if (qualityRatings[q._id]) {
    response.qualityResponse = qualityRatings[q._id];
  }

  // Add volume response if provided (optional)
  if (volumeRatings[q._id]) {
    response.volumeResponse = volumeRatings[q._id];
  }

  return response;
});

// Submit
await fetch('/api/assessment/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ responses })
});
```

#### 6. Update Assessment Results Display

```javascript
// GET /api/assessment/result
const { data } = await response.json();

data.responses.forEach(response => {
  console.log('Main Rating:', response.selectedOption);
  console.log('Quality Rating:', response.qualityResponse || 'Not answered');
  console.log('Volume Rating:', response.volumeResponse || 'Not answered');
});
```

---

## 🔄 Part 2: New Sex Question

### What Changed

- **New question added:** "My sexual life is healthy and fulfilling"
- **Category:** Survival
- **Need Key:** "sex"
- **Total questions:** Now 42 (was 41)

### What You Need to Do

**Nothing special!** The sex question will automatically appear when you fetch questions:

```javascript
// GET /api/questions?category=Survival
// Will now return 11 questions (was 10), including the new sex question
```

The sex question has the same structure as other questions:
- Main question with standard 1-7 rating
- Quality sub-question with custom ratings
- Volume sub-question with custom ratings

**Example Sex Question:**
```javascript
{
  questionText: "My sexual life is healthy and fulfilling",
  category: "Survival",
  needKey: "sex",
  needLabel: "Sex",
  qualitySubQuestion: {
    questionText: "How would you rate the quality of your sexual well-being?",
    ratingOptions: [
      "1 = Severely troubled (major dysfunction/distress)",
      "2 = Very poor (significant dissatisfaction)",
      // ... up to 7
    ]
  },
  volumeSubQuestion: {
    questionText: "How well are your sexual needs being met? (frequency relative to your needs)",
    ratingOptions: [
      "1 = Completely unmet (severe deprivation)",
      "2 = Mostly unmet (significant gap)",
      // ... up to 7
    ]
  }
}
```

---

## 🔄 Part 3: New Learning Articles

### What Changed

Two new articles added to the Learn & Grow library:

1. **Sleep Article**
   - Title: "UNLEASHING YOUR SLEEP POTENTIAL"
   - Author: Shawn Dwyer, ACMC
   - Linked to: Sleep question (needKey: "sleep")

2. **Sex Article**
   - Title: "SEX ISN'T WHAT YOU THINK IT IS"
   - Author: Shawn Dwyer, ACMC
   - Linked to: Sex question (needKey: "sex")

### What You Need to Do

**Nothing special!** Articles are automatically linked to questions. When you fetch learning content:

```javascript
// GET /api/question-learning/question/{questionId}
// Returns article if it exists for that question

// Or get by needKey
// GET /api/assessment/needs-report
// Returns learningByNeed object with articles for lowest needs
```

**Example Response:**
```javascript
{
  "learningByNeed": {
    "sleep": {
      "title": "UNLEASHING YOUR SLEEP POTENTIAL",
      "content": "...",
      "learningType": "health",
      "readTimeMinutes": 8,
      "questionId": "...",
      "needLabel": "Sleep"
    },
    "sex": {
      "title": "SEX ISN'T WHAT YOU THINK IT IS",
      "content": "...",
      "learningType": "health",
      "readTimeMinutes": 10,
      "questionId": "...",
      "needLabel": "Sex"
    }
  }
}
```

---

## 🎨 UI/UX Implementation Guide

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Main Question (Large, Bold)             │
│ "I get 7-8 hours of quality sleep..."   │
│ [Standard 1-7 Rating Slider]           │
├─────────────────────────────────────────┤
│ Quality Sub-Question (Medium)           │
│ "How would you rate the quality..."     │
│ [Custom Rating Selector]                │
│  1 = Extremely poor (description)       │
│  2 = Very poor (description)           │
│  ...                                    │
├─────────────────────────────────────────┤
│ Volume Sub-Question (Medium)            │
│ "How many hours of sleep..."            │
│ [Custom Rating Selector]                │
│  1 = Less than 4 hours                  │
│  2 = 4-5 hours                          │
│  ...                                    │
└─────────────────────────────────────────┘
```

### Progressive Disclosure Options

**Option A: Show All Together**
- Display main question, quality, and volume at once
- User answers all three before moving to next question
- **Recommended for better UX**

**Option B: Step-by-Step**
- Show main question first
- After answering, reveal quality sub-question
- After quality, reveal volume sub-question
- Then move to next question

### Visual Indicators

- ✅ **Green checkmark** when main question answered
- ✅ **Green checkmark** when quality answered (if available)
- ✅ **Green checkmark** when volume answered (if available)
- ⚠️ **Warning** if main question not answered before submitting
- ℹ️ **Info icon** explaining that quality/volume are optional

---

## ⚠️ Important Rules

### 1. Main Rating is REQUIRED
- User **MUST** answer the main question
- Cannot submit assessment without main rating

### 2. Quality/Volume are OPTIONAL
- User can skip quality sub-question
- User can skip volume sub-question
- Don't force users to answer them

### 3. Use CUSTOM Rating Options
- **DO NOT** use generic "1 - Not at all true" to "7 - Completely true"
- **USE** the custom options from `question.qualitySubQuestion.ratingOptions`
- Each need has different rating descriptions!

### 4. Check if Sub-Questions Exist
```javascript
// Always check before displaying
{question.qualitySubQuestion && (
  <QualitySubQuestion question={question.qualitySubQuestion} />
)}

{question.volumeSubQuestion && (
  <VolumeSubQuestion question={question.volumeSubQuestion} />
)}
```

### 5. Validation

```javascript
function validateResponses(questions, mainRatings, qualityRatings, volumeRatings) {
  const errors = [];
  
  questions.forEach(q => {
    // Main rating required
    if (!mainRatings[q._id] || mainRatings[q._id] < 1 || mainRatings[q._id] > 7) {
      errors.push(`Main rating required for: ${q.questionText}`);
    }
    
    // Quality rating optional, but if provided must be 1-7
    if (qualityRatings[q._id] !== undefined) {
      if (qualityRatings[q._id] < 1 || qualityRatings[q._id] > 7) {
        errors.push(`Invalid quality rating for: ${q.questionText}`);
      }
    }
    
    // Volume rating optional, but if provided must be 1-7
    if (volumeRatings[q._id] !== undefined) {
      if (volumeRatings[q._id] < 1 || volumeRatings[q._id] > 7) {
        errors.push(`Invalid volume rating for: ${q.questionText}`);
      }
    }
  });
  
  return errors;
}
```

---

## 📝 Complete Implementation Example

### Step 1: Fetch Questions

```javascript
async function fetchQuestions() {
  const response = await fetch('/api/questions?section=1&sectionType=regular', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  return data; // Array of 42 questions
}
```

### Step 2: Initialize State

```javascript
const [questions, setQuestions] = useState([]);
const [mainRatings, setMainRatings] = useState({});
const [qualityRatings, setQualityRatings] = useState({});
const [volumeRatings, setVolumeRatings] = useState({});
```

### Step 3: Render Questions

```jsx
{questions.map(question => (
  <QuestionCard
    key={question._id}
    question={question}
    mainRating={mainRatings[question._id]}
    qualityRating={qualityRatings[question._id]}
    volumeRating={volumeRatings[question._id]}
    onMainRatingChange={(rating) => 
      setMainRatings(prev => ({ ...prev, [question._id]: rating }))
    }
    onQualityRatingChange={(rating) => 
      setQualityRatings(prev => ({ ...prev, [question._id]: rating }))
    }
    onVolumeRatingChange={(rating) => 
      setVolumeRatings(prev => ({ ...prev, [question._id]: rating }))
    }
  />
))}
```

### Step 4: Submit Assessment

```javascript
async function handleSubmit() {
  // Validate
  const errors = validateResponses(questions, mainRatings, qualityRatings, volumeRatings);
  if (errors.length > 0) {
    alert(errors.join('\n'));
    return;
  }
  
  // Prepare responses
  const responses = questions.map(q => {
    const response = {
      questionId: q._id,
      selectedOption: mainRatings[q._id],
    };
    
    if (qualityRatings[q._id]) {
      response.qualityResponse = qualityRatings[q._id];
    }
    
    if (volumeRatings[q._id]) {
      response.volumeResponse = volumeRatings[q._id];
    }
    
    return response;
  });
  
  // Submit
  const result = await fetch('/api/assessment/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ responses })
  });
  
  return await result.json();
}
```

### Step 5: Display Results

```javascript
async function getAssessmentResults() {
  const response = await fetch('/api/assessment/result', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  
  // Display results
  data.responses.forEach(response => {
    console.log('Question:', response.questionId);
    console.log('Main:', response.selectedOption);
    console.log('Quality:', response.qualityResponse || 'Not answered');
    console.log('Volume:', response.volumeResponse || 'Not answered');
  });
  
  // Display learning articles
  Object.entries(data.learningByNeed || {}).forEach(([needKey, learning]) => {
    if (learning) {
      console.log(`Article for ${needKey}:`, learning.title);
    }
  });
  
  return data;
}
```

---

## 🔗 API Endpoints Reference

### GET /api/questions
**Returns:** All questions with `qualitySubQuestion` and `volumeSubQuestion`

**Query Parameters:**
- `category`: Filter by category (Survival, Safety, Social, Self, Meta-Needs)
- `section`: Filter by section (1 = main questions)
- `sectionType`: Filter by type (regular = main questions)
- `needKey`: Filter by specific need (e.g., "sleep", "sex")

**Example:**
```javascript
GET /api/questions?category=Survival&section=1&sectionType=regular
// Returns 11 questions including the new sex question
```

### POST /api/assessment/submit
**Body:**
```json
{
  "responses": [
    {
      "questionId": "60d5ec49f1b2c8b5f8e4e5a1",
      "selectedOption": 5,
      "qualityResponse": 4,
      "volumeResponse": 6
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "categoryScores": { ... },
  "needScores": { ... },
  "overallScore": 5.2
}
```

### GET /api/assessment/result
**Returns:** Latest assessment with responses including quality/volume data

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "...",
    "categoryScores": { ... },
    "needScores": { ... },
    "responses": [
      {
        "questionId": "...",
        "selectedOption": 5,
        "qualityResponse": 4,
        "volumeResponse": 6,
        "category": "Survival",
        "needKey": "sleep"
      }
    ],
    "learningByNeed": {
      "sleep": {
        "title": "UNLEASHING YOUR SLEEP POTENTIAL",
        "content": "...",
        "readTimeMinutes": 8
      },
      "sex": {
        "title": "SEX ISN'T WHAT YOU THINK IT IS",
        "content": "...",
        "readTimeMinutes": 10
      }
    }
  }
}
```

### GET /api/question-learning/question/:questionId
**Returns:** Learning article for a specific question

**Example:**
```javascript
// Get sleep article
GET /api/question-learning/question/{sleepQuestionId}

// Get sex article
GET /api/question-learning/question/{sexQuestionId}
```

---

## 🧪 Testing Checklist

### Quality/Volume Sub-Questions
- [ ] Questions display with `qualitySubQuestion` and `volumeSubQuestion` fields
- [ ] Custom rating options are shown (not generic 1-7)
- [ ] Main question rating is required
- [ ] Quality rating is optional
- [ ] Volume rating is optional
- [ ] Assessment submission includes `qualityResponse` and `volumeResponse`
- [ ] Assessment results display quality/volume responses
- [ ] Validation works (1-7 range for all ratings)
- [ ] UI handles questions without qualitySubQuestion/volumeSubQuestion
- [ ] Backward compatibility with old assessments (without quality/volume)

### New Sex Question
- [ ] Sex question appears in Survival category questions
- [ ] Sex question has Quality sub-question
- [ ] Sex question has Volume sub-question
- [ ] Sex question can be answered and submitted
- [ ] Sex question appears in assessment results

### Learning Articles
- [ ] Sleep article appears in Learn & Grow library
- [ ] Sex article appears in Learn & Grow library
- [ ] Articles are linked to correct questions
- [ ] Articles appear in assessment recommendations
- [ ] Articles can be opened and read

---

## ❓ FAQ

### Quality/Volume Sub-Questions

**Q: Do I need to show quality/volume for all questions?**
A: No, they're optional. Check if `question.qualitySubQuestion` exists before displaying.

**Q: What if a question doesn't have qualitySubQuestion?**
A: That's fine! Just show the main question. Not all questions may have sub-questions.

**Q: Can I skip quality/volume responses?**
A: Yes! They're optional. Only main question rating is required.

**Q: Do I need to update existing assessments?**
A: No, old assessments still work. New assessments can include quality/volume.

**Q: How do I parse the rating options?**
A: They're strings like "1 = Extremely poor (description)". Extract the number (1-7) and display the full text.

**Q: Why are rating options different for each question?**
A: Each need has customized ratings. Sleep quality is different from food quality, etc.

### New Sex Question

**Q: Will the sex question appear automatically?**
A: Yes, when you fetch Survival category questions, it will be included.

**Q: Do I need special handling for the sex question?**
A: No, treat it like any other question. It has the same structure.

**Q: What if users don't want to answer the sex question?**
A: They can skip it (if your UI allows skipping), but it will be included in the question list.

### Learning Articles

**Q: How do I display the articles?**
A: Fetch them via `/api/question-learning/question/{questionId}` or get them from `/api/assessment/needs-report` in the `learningByNeed` object.

**Q: When should I show the articles?**
A: Show them in the Learn & Grow section, or recommend them when users have low scores for sleep/sex needs.

**Q: Can I show articles for all needs?**
A: Yes, but only sleep and sex articles are currently available. Others may be added later.

---

## 🎯 Quick Start Summary

### What You MUST Do:

1. ✅ **Update Question Component** to display Quality/Volume sub-questions
2. ✅ **Create Custom Rating Selector** for custom rating options
3. ✅ **Update State Management** to track quality/volume ratings
4. ✅ **Update Assessment Submission** to include qualityResponse/volumeResponse
5. ✅ **Update Results Display** to show quality/volume responses

### What You DON'T Need to Do:

- ❌ No special handling for sex question (it's just another question)
- ❌ No special handling for articles (they're automatically linked)
- ❌ No changes to question fetching (API already returns everything)

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Questions don't have qualitySubQuestion/volumeSubQuestion**
- **Solution:** Make sure you're fetching questions with `section=1&sectionType=regular`
- **Check:** Verify the question has these fields in API response

**Issue: Custom rating options not showing**
- **Solution:** Use `question.qualitySubQuestion.ratingOptions` (not `question.answerOptions`)
- **Check:** Verify the options array exists and has 7 items

**Issue: Assessment submission fails**
- **Solution:** Ensure `selectedOption` is provided (required)
- **Check:** `qualityResponse` and `volumeResponse` are optional, but if provided must be 1-7

**Issue: Sex question not appearing**
- **Solution:** Make sure you're fetching all Survival questions
- **Check:** Run the backend script `addSexQuestionAndArticles.js` if question is missing

**Issue: Articles not showing**
- **Solution:** Check if articles exist via `/api/question-learning/question/{questionId}`
- **Check:** Verify questionId matches the sleep/sex question IDs

---



## ✅ Implementation Priority

### High Priority (Must Do):
1. Display Quality/Volume sub-questions
2. Handle custom rating options
3. Update assessment submission
4. Update results display

### Medium Priority (Should Do):
1. Add visual indicators (checkmarks)
2. Add validation messages
3. Improve UI/UX for sub-questions

### Low Priority (Nice to Have):
1. Progressive disclosure (step-by-step)
2. Tooltips for rating descriptions
3. Save progress functionality

---

**Last Updated:** 2024-12-18  
**Version:** 2.0.0  
**Total Questions:** 42 (41 original + 1 new Sex question)  
**Total Articles:** Sleep + Sex articles added

---

## 🚀 Ready to Start?

1. Read this guide completely
2. Review the API endpoints
3. Update your question component
4. Test with the API
5. Deploy and verify

Good luck! 🎉

