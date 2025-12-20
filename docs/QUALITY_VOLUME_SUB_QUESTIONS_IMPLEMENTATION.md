# Quality & Volume Sub-Questions Implementation Guide

## Overview

This document describes the implementation of **Quality and Volume sub-questions** for the Self-Actualization assessment system. Each of the 41 main questions now has customized Quality and Volume sub-questions with need-specific rating options, replacing the generic V/Q (Vitality/Quality) questions.

---

## What Changed?

### Before
- Main questions had generic V (Vitality) and Q (Quality) sub-questions
- All sub-questions used the same generic rating scale: "1 - Not at all true" to "7 - Completely true"
- V/Q questions were stored as separate question documents

### After
- Main questions have **Quality** and **Volume** sub-questions embedded directly
- Each sub-question has **customized rating options** specific to that need
- Quality/Volume sub-questions are stored as part of the main question document

---

## Database Schema Changes

### Question Model (`Backend/src/models/Questions.js`)

**New Fields Added:**
```javascript
qualitySubQuestion: {
  questionText: String,        // e.g., "How would you rate the quality of your sleep last night?"
  ratingOptions: [String]      // Custom 1-7 rating options for this need
},
volumeSubQuestion: {
  questionText: String,        // e.g., "How many hours of sleep did you get last night?"
  ratingOptions: [String]      // Custom 1-7 rating options for this need
}
```

**Updated Enum:**
- `sectionType` now includes: `["regular", "V", "Q", "Quality", "Volume"]`
  - `"V"` and `"Q"` are legacy (backward compatibility)
  - `"Quality"` and `"Volume"` are new types

### UserAssessment Model (`Backend/src/models/UserAssessment.js`)

**New Fields in Response Object:**
```javascript
responses: [{
  // ... existing fields ...
  qualityResponse: Number,    // 1-7 rating for quality sub-question (optional)
  volumeResponse: Number      // 1-7 rating for volume sub-question (optional)
}]
```

**Updated Enum:**
- `sectionType` in responses now includes: `["regular", "V", "Q", "Quality", "Volume"]`

---

## API Changes

### 1. GET /api/questions

**Returns:** Questions with `qualitySubQuestion` and `volumeSubQuestion` fields

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "questionText": "I get 7-8 hours of quality, restorative sleep most nights",
      "category": "Survival",
      "sectionType": "regular",
      "qualitySubQuestion": {
        "questionText": "How would you rate the quality of your sleep last night?",
        "ratingOptions": [
          "1 = Extremely poor (restless, frequently waking, unrefreshing)",
          "2 = Very poor (significant disruption, feeling exhausted)",
          "3 = Poor (some disruption, tired upon waking)",
          "4 = Below average (moderate quality, somewhat rested)",
          "5 = Average (decent sleep, adequately rested)",
          "6 = Good (solid sleep, feeling refreshed)",
          "7 = Excellent (deep, restorative sleep, energized upon waking)"
        ]
      },
      "volumeSubQuestion": {
        "questionText": "How many hours of sleep did you get last night?",
        "ratingOptions": [
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
  ]
}
```

### 2. POST /api/assessment/submit

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "60d5ec49f1b2c8b5f8e4e5a1",
      "selectedOption": 5,
      "qualityResponse": 4,    // Optional: 1-7 rating
      "volumeResponse": 6     // Optional: 1-7 rating
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

### 3. GET /api/assessment/result

**Response includes:**
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
        "needKey": "sleep",
        "needLabel": "Sleep"
      }
    ],
    "pyramidStructure": { ... }
  }
}
```

---

## Data Migration

### Script: `Backend/scripts/updateQualityVolumeSubQuestions.js`

**Purpose:** Updates all 41 main questions in the database with Quality/Volume sub-questions

**Usage:**
```bash
cd Backend
node scripts/updateQualityVolumeSubQuestions.js
```

**What it does:**
1. Reads mapping from `Backend/data/qualityVolumeSubQuestions.js`
2. Finds each question by matching `mainQuestionText`
3. Updates question with `qualitySubQuestion` and `volumeSubQuestion`
4. Reports success/failure for each question

**Expected Output:**
```
🟡 Connecting to MongoDB...
✅ MongoDB connected

📋 Processing 41 question mappings...

✅ [1/41] Updated: "I get 7-8 hours of quality, restorative sleep most nights..."
✅ [2/41] Updated: "I eat nutritious, whole foods that fuel my body well..."
...

============================================================
📊 UPDATE SUMMARY
============================================================
✅ Successfully updated: 41
⚠️  Not found: 0
❌ Errors: 0
============================================================

🎉 All questions updated successfully!
```

---

## Data Mapping File

### Location: `Backend/data/qualityVolumeSubQuestions.js`

**Structure:**
```javascript
export const QUALITY_VOLUME_SUB_QUESTIONS = [
  {
    mainQuestionText: "I get 7-8 hours of quality, restorative sleep most nights",
    qualitySubQuestion: {
      questionText: "How would you rate the quality of your sleep last night?",
      ratingOptions: [
        "1 = Extremely poor (restless, frequently waking, unrefreshing)",
        // ... up to 7
      ]
    },
    volumeSubQuestion: {
      questionText: "How many hours of sleep did you get last night?",
      ratingOptions: [
        "1 = Less than 4 hours",
        // ... up to 7
      ]
    }
  },
  // ... 40 more questions
];
```

**Total:** 41 questions mapped (10 Survival + 5 Safety + 5 Social + 5 Self + 15 Meta-Needs)

---

## Frontend Integration Guide

### Step 1: Fetch Questions

```javascript
// GET /api/questions?section=1&sectionType=regular
const response = await fetch('/api/questions?section=1&sectionType=regular', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: questions } = await response.json();
```

### Step 2: Display Questions with Sub-Questions

For each question, display:
1. **Main Question** with standard 1-7 rating
2. **Quality Sub-Question** (if `qualitySubQuestion` exists) with custom rating options
3. **Volume Sub-Question** (if `volumeSubQuestion` exists) with custom rating options

**Example UI Flow:**
```
Question 1: "I get 7-8 hours of quality, restorative sleep most nights"
[Main Rating: 1-7 slider]

Quality: "How would you rate the quality of your sleep last night?"
[Dropdown/Radio with custom options:
  1 = Extremely poor (restless, frequently waking, unrefreshing)
  2 = Very poor (significant disruption, feeling exhausted)
  ...
  7 = Excellent (deep, restorative sleep, energized upon waking)
]

Volume: "How many hours of sleep did you get last night?"
[Dropdown/Radio with custom options:
  1 = Less than 4 hours
  2 = 4-5 hours
  ...
  7 = 9+ hours
]
```

### Step 3: Submit Assessment

```javascript
const responses = questions.map(q => ({
  questionId: q._id,
  selectedOption: mainQuestionRating,      // 1-7
  qualityResponse: qualitySubQuestionRating, // 1-7 (optional)
  volumeResponse: volumeSubQuestionRating    // 1-7 (optional)
}));

await fetch('/api/assessment/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ responses })
});
```

### Step 4: Display Results

```javascript
// GET /api/assessment/result
const { data } = await fetch('/api/assessment/result', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Access responses with quality/volume data
data.responses.forEach(response => {
  console.log('Main:', response.selectedOption);
  console.log('Quality:', response.qualityResponse);
  console.log('Volume:', response.volumeResponse);
});
```

---

## Key Differences: Quality vs Volume

### Quality Sub-Question
- **Focus:** How good/effective is the experience?
- **Example:** "How would you rate the quality of your sleep?"
- **Ratings:** Quality-focused descriptions (poor → excellent)

### Volume Sub-Question
- **Focus:** How much/quantity of the experience?
- **Example:** "How many hours of sleep did you get?"
- **Ratings:** Quantity-focused descriptions (less → more)

---

## Validation Rules

1. **Main Question Response:** Required, must be 1-7
2. **Quality Response:** Optional, if provided must be 1-7
3. **Volume Response:** Optional, if provided must be 1-7
4. **Custom Rating Options:** Each need has unique rating descriptions

---

## Backward Compatibility

- **Legacy V/Q Questions:** Still supported (`sectionType: "V"` or `"Q"`)
- **Old Assessments:** Continue to work (qualityResponse/volumeResponse are optional)
- **API Endpoints:** No breaking changes, only additions

---

## Testing Checklist

- [ ] Run migration script: `node scripts/updateQualityVolumeSubQuestions.js`
- [ ] Verify all 41 questions have qualitySubQuestion and volumeSubQuestion
- [ ] Test GET /api/questions returns sub-questions
- [ ] Test POST /api/assessment/submit with qualityResponse and volumeResponse
- [ ] Test GET /api/assessment/result returns responses with quality/volume data
- [ ] Verify custom rating options are displayed correctly in frontend
- [ ] Test validation (1-7 range for all responses)

---

## Files Modified

1. **Backend/src/models/Questions.js** - Added qualitySubQuestion and volumeSubQuestion fields
2. **Backend/src/models/UserAssessment.js** - Added qualityResponse and volumeResponse fields
3. **Backend/src/controllers/assessmentController.js** - Updated submitAssessment and getLatestAssessment
4. **Backend/src/controllers/questionController.js** - Updated sectionType validation
5. **Backend/data/qualityVolumeSubQuestions.js** - Created mapping file (NEW)
6. **Backend/scripts/updateQualityVolumeSubQuestions.js** - Created migration script (NEW)

---

## Next Steps

1. **Run Migration:** Execute the update script to populate Quality/Volume sub-questions
2. **Frontend Update:** Update frontend to display Quality/Volume sub-questions with custom rating options
3. **Testing:** Test complete assessment flow with Quality/Volume responses
4. **Documentation:** Update frontend developer documentation

---

## Support

For questions or issues:
- Check migration script output for errors
- Verify questions exist in database with correct `mainQuestionText`
- Ensure MongoDB connection is working
- Review API responses to confirm sub-questions are included

---

**Last Updated:** 2024-12-18
**Version:** 1.0.0

