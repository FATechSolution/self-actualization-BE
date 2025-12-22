# Frontend Developer Guide: Quality & Volume Sub-Questions

## 🎯 Overview

The assessment system has been updated to include **Quality and Volume sub-questions** for each main question. Instead of generic V/Q questions, each of the 41 main questions now has customized Quality and Volume sub-questions with need-specific rating options.

---

## 📋 What Changed in Backend

### ✅ What's New

1. **Main questions now include sub-questions:**
   - Each question has `qualitySubQuestion` and `volumeSubQuestion` fields
   - Each sub-question has custom rating options (not generic 1-7 scale)

2. **Assessment submission accepts new fields:**
   - `qualityResponse` (optional, 1-7)
   - `volumeResponse` (optional, 1-7)

3. **Assessment results include sub-question responses:**
   - Responses array now includes `qualityResponse` and `volumeResponse`

### ❌ What's Removed/Deprecated

- **V/Q questions as separate documents** (still supported for backward compatibility, but not recommended)
- Generic rating scales for sub-questions

---

## 🔄 What You Need to Change

### 1. **Question Display Component**

**Before:**
```javascript
// Old: Just main question
<QuestionCard 
  question={question.questionText}
  rating={selectedRating}
  onRatingChange={handleRatingChange}
/>
```

**After:**
```javascript
// New: Main question + Quality + Volume sub-questions
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

### 2. **Question Data Structure**

**New Question Object Structure:**
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

### 3. **Assessment Submission**

**Before:**
```javascript
const responses = questions.map(q => ({
  questionId: q._id,
  selectedOption: ratings[q._id] // Just main rating
}));
```

**After:**
```javascript
const responses = questions.map(q => ({
  questionId: q._id,
  selectedOption: ratings[q._id],           // Main question rating (required)
  qualityResponse: qualityRatings[q._id],   // Quality sub-question (optional)
  volumeResponse: volumeRatings[q._id]       // Volume sub-question (optional)
}));
```

### 4. **Assessment Results Display**

**Before:**
```javascript
assessment.responses.forEach(response => {
  console.log('Rating:', response.selectedOption);
});
```

**After:**
```javascript
assessment.responses.forEach(response => {
  console.log('Main Rating:', response.selectedOption);
  console.log('Quality Rating:', response.qualityResponse); // NEW
  console.log('Volume Rating:', response.volumeResponse);   // NEW
});
```

---

## 💻 Implementation Guide

### Step 1: Update Question Fetching

**No changes needed!** The API already returns `qualitySubQuestion` and `volumeSubQuestion`:

```javascript
// GET /api/questions?section=1&sectionType=regular
const response = await fetch('/api/questions?section=1&sectionType=regular', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data: questions } = await response.json();

// Each question now has:
questions.forEach(q => {
  if (q.qualitySubQuestion) {
    console.log('Quality:', q.qualitySubQuestion.questionText);
    console.log('Quality Options:', q.qualitySubQuestion.ratingOptions);
  }
  
  if (q.volumeSubQuestion) {
    console.log('Volume:', q.volumeSubQuestion.questionText);
    console.log('Volume Options:', q.volumeSubQuestion.ratingOptions);
  }
});
```

### Step 2: Update State Management

**Add state for Quality/Volume ratings:**

```javascript
// React Example
const [mainRatings, setMainRatings] = useState({});
const [qualityRatings, setQualityRatings] = useState({});  // NEW
const [volumeRatings, setVolumeRatings] = useState({});    // NEW

// Update handlers
const handleMainRating = (questionId, rating) => {
  setMainRatings(prev => ({ ...prev, [questionId]: rating }));
};

const handleQualityRating = (questionId, rating) => {  // NEW
  setQualityRatings(prev => ({ ...prev, [questionId]: rating }));
};

const handleVolumeRating = (questionId, rating) => {   // NEW
  setVolumeRatings(prev => ({ ...prev, [questionId]: rating }));
};
```

### Step 3: Update Question Component

**Example React Component:**

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

### Step 4: Custom Rating Selector Component

**Important:** Quality/Volume sub-questions use **custom rating options**, not generic 1-7!

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

**Alternative: Dropdown/Select:**
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

### Step 5: Update Assessment Submission

```javascript
async function submitAssessment(questions, mainRatings, qualityRatings, volumeRatings) {
  const responses = questions.map(question => {
    const response = {
      questionId: question._id,
      selectedOption: mainRatings[question._id], // Required
    };

    // Add quality response if provided
    if (qualityRatings[question._id]) {
      response.qualityResponse = qualityRatings[question._id];
    }

    // Add volume response if provided
    if (volumeRatings[question._id]) {
      response.volumeResponse = volumeRatings[question._id];
    }

    return response;
  });

  const response = await fetch('/api/assessment/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ responses })
  });

  return await response.json();
}
```

### Step 6: Update Results Display

```javascript
async function getAssessmentResults() {
  const response = await fetch('/api/assessment/result', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  
  // Display results with quality/volume data
  data.responses.forEach(response => {
    console.log('Question ID:', response.questionId);
    console.log('Main Rating:', response.selectedOption);
    console.log('Quality Rating:', response.qualityResponse || 'Not answered');
    console.log('Volume Rating:', response.volumeResponse || 'Not answered');
  });
  
  return data;
}
```

---

## 🎨 UI/UX Recommendations

### 1. **Visual Hierarchy**

```
┌─────────────────────────────────────┐
│ Main Question (Larger, Bold)       │
│ [Standard 1-7 Rating Slider]        │
├─────────────────────────────────────┤
│ Quality Sub-Question (Medium)       │
│ [Custom Rating Selector]            │
├─────────────────────────────────────┤
│ Volume Sub-Question (Medium)        │
│ [Custom Rating Selector]            │
└─────────────────────────────────────┘
```

### 2. **Progressive Disclosure**

**Option A: Show all at once**
- Display main question, quality, and volume together
- User answers all three before moving to next question

**Option B: Step-by-step**
- Show main question first
- After answering, reveal quality sub-question
- After quality, reveal volume sub-question
- Then move to next question

### 3. **Visual Indicators**

- ✅ Checkmark when main question answered
- ✅ Checkmark when quality answered (if available)
- ✅ Checkmark when volume answered (if available)
- ⚠️ Warning if main question not answered before submitting

### 4. **Rating Display**

**For Custom Options:**
- Show full text: "1 = Extremely poor (restless, frequently waking, unrefreshing)"
- Or show compact: "1 - Extremely poor"
- Tooltip for full description

---

## ⚠️ Important Notes

### 1. **Quality/Volume are Optional**

- Main question rating is **REQUIRED**
- Quality response is **OPTIONAL**
- Volume response is **OPTIONAL**
- User can skip quality/volume if they want

### 2. **Custom Rating Options**

- **DO NOT** use generic "1 - Not at all true" to "7 - Completely true"
- **USE** the custom options from `question.qualitySubQuestion.ratingOptions`
- Each need has different rating descriptions!

### 3. **Backward Compatibility**

- Old assessments without quality/volume still work
- API accepts responses with or without qualityResponse/volumeResponse
- Check if `qualitySubQuestion` exists before displaying

### 4. **Validation**

```javascript
// Validate before submission
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

## 📝 Example: Complete Assessment Flow

```javascript
// 1. Fetch questions
const questions = await fetchQuestions();

// 2. Initialize state
const [mainRatings, setMainRatings] = useState({});
const [qualityRatings, setQualityRatings] = useState({});
const [volumeRatings, setVolumeRatings] = useState({});

// 3. Render questions
questions.map(question => (
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
));

// 4. Submit assessment
const handleSubmit = async () => {
  // Validate
  const errors = validateResponses(questions, mainRatings, qualityRatings, volumeRatings);
  if (errors.length > 0) {
    alert(errors.join('\n'));
    return;
  }
  
  // Submit
  const result = await submitAssessment(questions, mainRatings, qualityRatings, volumeRatings);
  console.log('Assessment submitted:', result);
};
```

---

## 🧪 Testing Checklist

- [ ] Questions display with qualitySubQuestion and volumeSubQuestion
- [ ] Custom rating options are shown (not generic 1-7)
- [ ] Main question rating is required
- [ ] Quality rating is optional
- [ ] Volume rating is optional
- [ ] Assessment submission includes qualityResponse and volumeResponse
- [ ] Assessment results display quality/volume responses
- [ ] Validation works (1-7 range)
- [ ] UI handles questions without qualitySubQuestion/volumeSubQuestion
- [ ] Backward compatibility with old assessments

---

## 🔗 API Endpoints Reference

### GET /api/questions
**Returns:** Questions with `qualitySubQuestion` and `volumeSubQuestion`

### POST /api/assessment/submit
**Body:**
```json
{
  "responses": [
    {
      "questionId": "...",
      "selectedOption": 5,
      "qualityResponse": 4,
      "volumeResponse": 6
    }
  ]
}
```

### GET /api/assessment/result
**Returns:** Assessment with responses including `qualityResponse` and `volumeResponse`

---

## ❓ FAQ

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

---

## 📞 Support

If you encounter issues:
1. Check API responses in browser DevTools
2. Verify questions have `qualitySubQuestion` and `volumeSubQuestion` fields
3. Ensure rating values are 1-7
4. Check backend logs for validation errors

---

**Last Updated:** 2024-12-18  
**Version:** 1.0.0


