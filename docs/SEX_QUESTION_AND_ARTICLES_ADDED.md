# Sex Question and Articles Implementation

## Overview

This document describes the addition of the **Sex question** to the assessment and the creation of **Sleep** and **Sex** learning articles in the library.

---

## What Was Added

### 1. Sex Question Added to Assessment

**Question Details:**
- **Main Question:** "My sexual life is healthy and fulfilling"
- **Category:** Survival
- **Need Key:** "sex"
- **Need Label:** "Sex"
- **Section Order:** 8 (after Exercise, before Money)

**Quality Sub-Question:**
- **Question:** "How would you rate the quality of your sexual well-being?"
- **Rating Options:**
  - 1 = Severely troubled (major dysfunction/distress)
  - 2 = Very poor (significant dissatisfaction)
  - 3 = Poor (frustrating, unfulfilling)
  - 4 = Fair (acceptable but not satisfying)
  - 5 = Good (satisfying and healthy)
  - 6 = Very good (fulfilling and pleasurable)
  - 7 = Excellent (deeply fulfilling and joyful)

**Volume Sub-Question:**
- **Question:** "How well are your sexual needs being met? (frequency relative to your needs)"
- **Rating Options:**
  - 1 = Completely unmet (severe deprivation)
  - 2 = Mostly unmet (significant gap)
  - 3 = Often unmet (frequent frustration)
  - 4 = Sometimes unmet (moderate gap)
  - 5 = Usually met (occasional gap)
  - 6 = Well met (rarely wanting)
  - 7 = Fully met (completely satisfied)

### 2. Sleep Article Added to Library

**Article Details:**
- **Title:** "UNLEASHING YOUR SLEEP POTENTIAL"
- **Subtitle:** "A Strategy for Peaceful and Rejuvenating Sleep"
- **Author:** Shawn Dwyer, ACMC
- **Learning Type:** health
- **Read Time:** 8 minutes
- **Linked to:** Sleep question (needKey: "sleep")

**Content:** Full article covering:
- The real problem with poor sleep
- How we sabotage our sleep
- Three-stage sleep strategy
- Inner game of sleep
- Sleep checklist

### 3. Sex Article Added to Library

**Article Details:**
- **Title:** "SEX ISN'T WHAT YOU THINK IT IS"
- **Subtitle:** "Why Understanding Your Real Needs Changes Everything"
- **Author:** Shawn Dwyer, ACMC
- **Learning Type:** health
- **Read Time:** 10 minutes
- **Linked to:** Sex question (needKey: "sex")

**Content:** Full article covering:
- The fundamental distinction (sex as strategy vs survival need)
- What we actually need (psychological needs)
- Sex as strategy
- Where we get it wrong
- The neediness trap
- The solution
- Why sex feels emotional
- The real questions
- The path forward

---

## Files Modified/Created

### Created Files:
1. **`Backend/scripts/addSexQuestionAndArticles.js`** - Script to add sex question and both articles
2. **`Backend/docs/SEX_QUESTION_AND_ARTICLES_ADDED.md`** - This documentation

### Modified Files:
1. **`Backend/data/qualityVolumeSubQuestions.js`** - Fixed sex question mapping (was incorrectly mapped to money question)

---

## How to Run

### Step 1: Run the Script

```bash
cd Backend
node scripts/addSexQuestionAndArticles.js
```

### Expected Output:

```
🟡 Connecting to MongoDB...
✅ MongoDB connected

✅ Found sleep question: I get 7-8 hours of quality, restorative sleep most nights

📝 Adding Sex question to database...

✅ Sex question created successfully

📚 Adding Sleep article to library...

✅ Sleep article created successfully

📚 Adding Sex article to library...

✅ Sex article created successfully

============================================================
🎉 ALL TASKS COMPLETED SUCCESSFULLY!
============================================================
✅ Sex question added/updated
✅ Sleep article added/updated
✅ Sex article added/updated
============================================================

🔒 MongoDB connection closed
```

---

## What the Script Does

1. **Connects to MongoDB** using `MONGO_URI` from environment
2. **Finds Sleep Question** (must exist - run `updateQualityVolumeSubQuestions.js` first if needed)
3. **Adds/Updates Sex Question:**
   - Checks if sex question already exists
   - Creates new question if not found
   - Updates with Quality/Volume sub-questions if exists
4. **Adds/Updates Sleep Article:**
   - Checks if article already exists for sleep question
   - Creates new article if not found
   - Updates content if exists
5. **Adds/Updates Sex Article:**
   - Checks if article already exists for sex question
   - Creates new article if not found
   - Updates content if exists

---

## Database Changes

### Questions Collection
- **New Question Added:** Sex question with all fields including Quality/Volume sub-questions
- **Total Questions:** Now 42 (was 41)

### QuestionLearning Collection
- **New Article:** Sleep article linked to sleep question
- **New Article:** Sex article linked to sex question

---

## API Endpoints Affected

### GET /api/questions
- Now returns sex question when fetching Survival category questions
- Sex question includes `qualitySubQuestion` and `volumeSubQuestion`

### GET /api/question-learning/question/:questionId
- Returns sleep article when querying sleep question
- Returns sex article when querying sex question

### GET /api/assessment/needs-report
- Sex need will appear in need scores if user answers the sex question
- Sleep article will appear in `learningByNeed` for sleep need

---

## Verification

After running the script, verify:

1. **Sex Question Exists:**
   ```bash
   # Query MongoDB or use API
   GET /api/questions?category=Survival&needKey=sex
   ```

2. **Articles Exist:**
   ```bash
   # Get sleep article
   GET /api/question-learning/question/{sleepQuestionId}
   
   # Get sex article
   GET /api/question-learning/question/{sexQuestionId}
   ```

3. **Check Assessment Flow:**
   - Sex question appears in assessment
   - Quality/Volume sub-questions display correctly
   - Articles appear in Learn & Grow section

---

## Notes

- **Idempotent:** Script can be run multiple times safely (checks for existing records)
- **Updates Existing:** If sex question or articles already exist, they will be updated
- **Dependencies:** Sleep question must exist (should already be in database)
- **Read Time:** Estimated based on article length (Sleep: 8 min, Sex: 10 min)

---

## Frontend Impact

### New Question in Assessment
- Frontend will automatically receive sex question when fetching Survival category questions
- Frontend should display Quality/Volume sub-questions for sex question

### New Articles in Library
- Sleep article will appear when user views learning content for sleep need
- Sex article will appear when user views learning content for sex need
- Articles will be recommended in assessment reports for users with low scores

---

## Troubleshooting

### Issue: "Sleep question not found"
**Solution:** Run `updateQualityVolumeSubQuestions.js` first to ensure all questions exist

### Issue: "Sex question already exists but wrong"
**Solution:** Script will update it. If issues persist, manually delete and re-run

### Issue: "Article already exists"
**Solution:** Script will update existing article with new content

---

**Last Updated:** 2024-12-18  
**Version:** 1.0.0

