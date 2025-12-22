# Postman Collection: Sex Question & Articles Testing

## 📦 Collection File
`Backend/docs/postman/Sex-Question-And-Articles-Testing.postman_collection.json`

## 🚀 Quick Start

### Step 1: Import Collection
1. Open Postman
2. Click **Import**
3. Select `Sex-Question-And-Articles-Testing.postman_collection.json`
4. Collection will be imported with all endpoints

### Step 2: Set Environment Variable
1. Create a new environment in Postman (or use existing)
2. Add variable: `baseUrl` = `https://self-actualization-analysis-be.vercel.app`
3. Select this environment

### Step 3: Run Tests
Follow the numbered folders in order:

---

## 📋 Collection Structure

### 1. Authentication
- **Register User** - Creates new account, auto-saves token
- **Login User** - Logs in, auto-saves token

**Auto-Saves:**
- `authToken` - JWT token for authenticated requests
- `userId` - User ID

### 2. Questions - Sex & Sleep
- **Get All Survival Questions** - Includes sex question
- **Get Sex Question by needKey** - Get sex question specifically
- **Get Sleep Question by needKey** - Get sleep question specifically
- **Get Single Question by ID** - Get question by ID (auto-saves question ID)

**What to Check:**
- ✅ Sex question has `qualitySubQuestion` field
- ✅ Sex question has `volumeSubQuestion` field
- ✅ Rating options are custom (not generic 1-7)

### 3. Learning Articles - Sleep & Sex
- **Get Sleep Article by Question ID** - Returns sleep article
- **Get Sex Article by Question ID** - Returns sex article
- **Get All Learning Articles** - Lists all articles

**What to Check:**
- ✅ Sleep article title: "UNLEASHING YOUR SLEEP POTENTIAL"
- ✅ Sex article title: "SEX ISN'T WHAT YOU THINK IT IS"
- ✅ Articles have full content
- ✅ Articles linked to correct questions

### 4. Assessment - Submit with Sex Question
- **Submit Assessment (With Sex Question + Quality/Volume)** - Full example
- **Submit Assessment (Sex Question Only - Minimal)** - Just main rating
- **Submit Assessment (Sex Question with Quality/Volume)** - With sub-questions

**Important:**
- Replace `REPLACE_WITH_SEX_QUESTION_ID` with actual question ID
- Get question ID from "Get Sex Question by needKey" request
- `selectedOption` is required (1-7)
- `qualityResponse` is optional (1-7)
- `volumeResponse` is optional (1-7)

### 5. Assessment Results
- **Get Latest Assessment Result** - View submitted assessment
- **Get Needs Report** - Get recommendations with articles

**What to Check:**
- ✅ Responses include `qualityResponse` and `volumeResponse`
- ✅ Sex need appears in `needScores`
- ✅ Sex article appears in `learningByNeed` if sex is low-scoring

### 6. Quick Test Flow
- **Complete Test Flow** - Quick reference guide

---

## 🧪 Testing Checklist

### ✅ Authentication
- [ ] Register user successfully
- [ ] Login user successfully
- [ ] Token auto-saved to `authToken` variable

### ✅ Questions
- [ ] Sex question exists in Survival category
- [ ] Sex question has `qualitySubQuestion` with custom rating options
- [ ] Sex question has `volumeSubQuestion` with custom rating options
- [ ] Sleep question has Quality/Volume sub-questions

### ✅ Articles
- [ ] Sleep article exists and is linked to sleep question
- [ ] Sex article exists and is linked to sex question
- [ ] Articles have full content
- [ ] Articles have correct titles

### ✅ Assessment Submission
- [ ] Can submit assessment with sex question (main rating only)
- [ ] Can submit assessment with sex question + qualityResponse
- [ ] Can submit assessment with sex question + volumeResponse
- [ ] Can submit assessment with sex question + both qualityResponse and volumeResponse

### ✅ Assessment Results
- [ ] Assessment result includes sex question in responses
- [ ] Responses include `qualityResponse` if provided
- [ ] Responses include `volumeResponse` if provided
- [ ] Sex need appears in `needScores`
- [ ] Sex article appears in `learningByNeed` if sex is low-scoring

---

## 📝 Example Request Bodies

### Register
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

### Login
```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

### Submit Assessment (With Sex Question)
```json
{
  "responses": [
    {
      "questionId": "ACTUAL_SEX_QUESTION_ID_HERE",
      "selectedOption": 6,
      "qualityResponse": 5,
      "volumeResponse": 7
    }
  ]
}
```

---

## 🔍 How to Get Question IDs

1. Run **"Get Sex Question by needKey"** request
2. In response, find the `_id` field
3. Copy the `_id` value
4. Replace `REPLACE_WITH_SEX_QUESTION_ID` in assessment submission requests

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c8b5f8e4e5a1",  // ← Copy this
      "questionText": "My sexual life is healthy and fulfilling",
      "needKey": "sex",
      ...
    }
  ]
}
```

---

## ⚠️ Important Notes

1. **Question IDs are Required:** You must get actual question IDs from the database before submitting assessments
2. **Token Auto-Save:** Register/Login requests automatically save token to `authToken` variable
3. **Environment Variables:** Make sure `baseUrl` is set in your Postman environment
4. **Replace Placeholders:** Assessment submission requests have `REPLACE_WITH_*` placeholders - replace with actual IDs

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized"
**Solution:** Make sure you've run Register/Login and token is saved to `authToken`

### Issue: "Question not found"
**Solution:** Run the database script first: `node scripts/addSexQuestionAndArticles.js`

### Issue: "Invalid questionId format"
**Solution:** Make sure you're using actual MongoDB ObjectId, not placeholder text

### Issue: "Article not found"
**Solution:** Verify articles were created by running the script: `node scripts/addSexQuestionAndArticles.js`

---

## 📞 Support

If you encounter issues:
1. Check that database script ran successfully
2. Verify question IDs are correct (MongoDB ObjectId format)
3. Check Postman console for auto-saved variables
4. Verify `baseUrl` environment variable is set

---

**Last Updated:** 2024-12-18

