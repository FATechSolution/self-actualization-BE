import mongoose from "mongoose";
import Question from "../models/Questions.js";
import UserAssessment from "../models/UserAssessment.js";
import User from "../models/User.js";
import QuestionLearning from "../models/QuestionLearning.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../utils/errorHandler.js";
import { getCategoriesForSubscription, validateCategoriesForSubscription } from "../utils/subscription.js";
import PDFDocument from "pdfkit";

const VALID_SCORE_MIN = 1;
const VALID_SCORE_MAX = 7;

export const submitAssessment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { responses } = req.body || {};

  if (!Array.isArray(responses) || responses.length === 0) {
    throw new AppError("Responses are required", 400);
  }

  // Get user's subscription to validate categories
  const user = await User.findById(userId).select("currentSubscriptionType");
  
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const subscriptionType = user.currentSubscriptionType || "Free";
  const availableCategories = getCategoriesForSubscription(subscriptionType);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const questionIds = responses
      .map((response) => response?.questionId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (!questionIds.length) {
      throw new AppError("No valid question IDs provided", 400);
    }

    const questions = await Question.find({ _id: { $in: questionIds } })
      .select(["_id", "category", "needKey", "needLabel", "sectionType", "parentQuestionId"])
      .lean();

    if (!questions.length) {
      throw new AppError("No matching questions found for given IDs", 400);
    }

    // Get all unique categories from questions
    const questionCategories = [...new Set(questions.map((q) => q.category))];

    // Validate categories against subscription
    const validation = validateCategoriesForSubscription(questionCategories, subscriptionType);
    if (!validation.isValid) {
      throw new AppError(validation.message, 403);
    }

    const categoryTotals = {};
    const categoryCounts = {};
    const needTotals = {};
    const needCounts = {};
    const validResponses = [];

    for (const response of responses) {
      const question = questions.find((q) => q._id.toString() === response.questionId);
      if (!question) {
        continue;
      }

      // Double-check: ensure question category is available for subscription (extra security)
      if (!availableCategories.includes(question.category)) {
        throw new AppError(
          `Question from category "${question.category}" is not available in your ${subscriptionType} subscription.`,
          403
        );
      }

      const score = Number(response.selectedOption);
      if (Number.isNaN(score) || score < VALID_SCORE_MIN || score > VALID_SCORE_MAX) {
        continue;
      }

      // Get quality and volume responses if provided (for main questions)
      const qualityResponse = response.qualityResponse !== undefined 
        ? Number(response.qualityResponse) 
        : null;
      const volumeResponse = response.volumeResponse !== undefined 
        ? Number(response.volumeResponse) 
        : null;

      // Validate quality/volume responses if provided
      if (qualityResponse !== null && (Number.isNaN(qualityResponse) || qualityResponse < VALID_SCORE_MIN || qualityResponse > VALID_SCORE_MAX)) {
        continue; // Skip invalid quality response
      }
      if (volumeResponse !== null && (Number.isNaN(volumeResponse) || volumeResponse < VALID_SCORE_MIN || volumeResponse > VALID_SCORE_MAX)) {
        continue; // Skip invalid volume response
      }

      validResponses.push({
        questionId: question._id,
        selectedOption: score,
        category: question.category,
        needKey: question.needKey || null,
        needLabel: question.needLabel || null,
        sectionType: question.sectionType || "regular",
        parentQuestionId: question.parentQuestionId || null,
        qualityResponse: qualityResponse,
        volumeResponse: volumeResponse,
      });

      categoryTotals[question.category] = (categoryTotals[question.category] || 0) + score;
      categoryCounts[question.category] = (categoryCounts[question.category] || 0) + 1;

      if (question.needKey) {
        needTotals[question.needKey] = (needTotals[question.needKey] || 0) + score;
        needCounts[question.needKey] = (needCounts[question.needKey] || 0) + 1;
      }
    }

    if (!validResponses.length) {
      throw new AppError("No valid responses", 400);
    }

    const categoryScores = {};
    Object.keys(categoryTotals).forEach((categoryKey) => {
      categoryScores[categoryKey] = Number(
        (categoryTotals[categoryKey] / categoryCounts[categoryKey]).toFixed(2)
      );
    });

    const needScores = {};
    Object.keys(needTotals).forEach((nk) => {
      const q = questions.find((qq) => qq.needKey === nk);
      needScores[nk] = {
        score: Number((needTotals[nk] / needCounts[nk]).toFixed(2)),
        needLabel: q?.needLabel || null,
        category: q?.category || null,
      };
    });

    const overallScore =
      Object.keys(categoryScores).length > 0
        ? Number(
            (
              Object.values(categoryScores).reduce((sum, value) => sum + value, 0) /
              Object.values(categoryScores).length
            ).toFixed(2)
          )
        : 0;

    await UserAssessment.create(
      [
        {
          userId,
          responses: validResponses,
          categoryScores,
          needScores,
          overallScore,
          completedAt: new Date(),
        },
      ],
      { session }
    );

    // Update user flag to indicate assessment completion
    const completionDate = new Date();
    await User.findByIdAndUpdate(
      userId,
      {
        hasCompletedAssessment: true,
        assessmentCompletedAt: completionDate,
      },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      categoryScores,
      needScores,
      overallScore,
      hasCompletedAssessment: true,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const getLatestAssessment = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
  
    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }
  
    const latestAssessment = await UserAssessment.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
  
    if (!latestAssessment) {
      throw new AppError("No assessment found for this user", 404);
    }
  
    const categoryScores = latestAssessment.categoryScores || {};
    const needScores = latestAssessment.needScores || {};
  
    const overallScore =
      latestAssessment.overallScore ??
      (Object.keys(categoryScores).length
        ? Number(
            (
              Object.values(categoryScores).reduce((sum, value) => sum + value, 0) /
              Object.values(categoryScores).length
            ).toFixed(2)
          )
        : 0);
  
    // Define static chart metadata (bands and descriptions) - EXACT from PDF
    const chartMeta = {
      performanceBands: [
        { 
          label: "Dysfunctional", 
          subLabels: ["Neurotic", "Psychotic"],
          range: [1, 1.5], 
          color: "#E63946" 
        },
        { 
          label: "Extremes", 
          subLabels: ["Too much", "Too Little"],
          range: [1.5, 2.5], 
          color: "#DC3545" 
        },
        { 
          label: "Not getting by", 
          subLabels: ["Cravings", "Dissatisfaction"],
          range: [2.5, 3.5], 
          color: "#F1C40F" 
        },
        { 
          label: "Doing OK", 
          subLabels: ["Getting By", "Normal Concerns"],
          range: [3.5, 4.5], 
          color: "#FFC107" 
        },
        { 
          label: "Getting by well", 
          subLabels: ["Feeling Good"],
          range: [4.5, 5.5], 
          color: "#90EE90" 
        },
        { 
          label: "Doing Good", 
          subLabels: ["Thriving"],
          range: [5.5, 6.5], 
          color: "#2ECC71" 
        },
        { 
          label: "Optimizing", 
          subLabels: ["Super-Thriving"],
          range: [6.5, 7], 
          color: "#27AE60" 
        },
        { 
          label: "Maximizing", 
          subLabels: ["At ones very best"],
          range: [7, 7], 
          color: "#1E8449" 
        },
      ],
      categoryDescriptions: {
        Survival: "Physical needs, health, energy, rest, and nutrition.",
        Safety: "Stability, financial security, and sense of control.",
        Social: "Belonging, love, connection, and relationships.",
        Self: "Confidence, respect, and personal achievement.",
        "Meta-Needs": "Purpose, creativity, contribution, and self-actualization.",
      },
    };

    // EXACT needs list from PDF - organized by category
    const pyramidNeeds = {
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
    };

    // Map needScores to pyramid needs structure with questionIds
    const pyramidNeedScoresWithIds = {};
    for (const [category, needs] of Object.entries(pyramidNeeds)) {
      pyramidNeedScoresWithIds[category] = await Promise.all(needs.map(async (needLabel, index) => {
        // Try to find matching needKey from assessment
        const needKeyMatch = Object.keys(needScores).find(key => {
          const scoreData = needScores[key];
          const scoreLabel = scoreData?.needLabel || key;
          return scoreLabel.toLowerCase().includes(needLabel.toLowerCase().split(':')[0].trim()) ||
                 needLabel.toLowerCase().includes(scoreLabel.toLowerCase());
        });

        let score = 0;
        let questionId = null;
        let matchedNeedKey = null;

        if (needKeyMatch) {
          const scoreData = needScores[needKeyMatch];
          score = scoreData?.score || 0;
          matchedNeedKey = needKeyMatch;
          
          // Find questionId for this need
          const question = await Question.findOne({
            needKey: needKeyMatch,
            category: category,
            section: 1,
            sectionType: "regular",
            isActive: true,
          })
            .select("_id")
            .lean();
          
          if (question) questionId = question._id;
        }

        return {
          needLabel: needLabel,
          needKey: matchedNeedKey,
          score: score,
          questionId: questionId,
          order: index + 1
        };
      }));
    }
  
    // Optional insight logic (can expand later)
    const lowestCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([cat]) => cat);
  
    res.status(200).json({
      success: true,
      message: "Latest assessment retrieved successfully",
      data: {
        assessmentId: latestAssessment._id,
        categoryScores,
        needScores,
        overallScore,
        lowestCategories,
        completedAt: latestAssessment.createdAt || latestAssessment.completedAt,
        chartMeta,
        // Responses include qualityResponse and volumeResponse for main questions
        responses: latestAssessment.responses || [],
        // NEW: Pyramid structure with exact needs from PDF
        pyramidStructure: {
          needs: pyramidNeeds, // Exact needs list by category
          needScores: pyramidNeedScoresWithIds, // Need scores mapped to pyramid needs with questionIds
          categoryOrder: ["Survival", "Safety", "Social", "Self", "Meta-Needs"] // Bottom to top order
        }
      },
    });
  });

// Need-level report with lowest needs, linked learning content, recommendations, and questionIds
export const getNeedReport = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);

  const latestAssessment = await UserAssessment.findOne({ userId }).sort({ createdAt: -1 }).lean();
  if (!latestAssessment) throw new AppError("No assessment found for this user", 404);

  const needScores = latestAssessment.needScores || {};
  const categoryScores = latestAssessment.categoryScores || {};

  // Convert needScores to array with questionId
  const needScoresArray = [];
  for (const [needKey, needData] of Object.entries(needScores)) {
    // Find the question for this need to get questionId
    const question = await Question.findOne({
      needKey: needKey,
      section: 1,
      sectionType: "regular",
      isActive: true,
    })
      .select("_id needKey needLabel category")
      .lean();

    needScoresArray.push({
      needKey,
      needLabel: needData.needLabel || needKey,
      score: needData.score || 0,
      category: needData.category || null,
      questionId: question?._id || null,
    });
  }

  // Sort by score (lowest first)
  const sortedNeeds = needScoresArray.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

  const lowestNeeds = sortedNeeds.slice(0, 3);
  const topNeed = sortedNeeds[0] || null;

  // Get learning content for lowest needs
  const learningByNeed = {};
  for (const n of lowestNeeds) {
    if (n.questionId) {
      const learning = await QuestionLearning.findOne({
        questionId: n.questionId,
        isActive: true,
      })
        .populate({
          path: "questionId",
          select: ["needKey", "needLabel", "category", "questionText"],
        })
        .lean();
      
      if (learning?.questionId) {
        learningByNeed[n.needKey] = {
          title: learning.title,
          learningType: learning.learningType,
          thumbnailUrl: learning.thumbnailUrl,
          questionId: learning.questionId._id,
          needLabel: learning.questionId.needLabel,
          category: learning.questionId.category,
        };
      } else {
        learningByNeed[n.needKey] = null;
      }
    } else {
      learningByNeed[n.needKey] = null;
    }
  }

  // Generate recommendations based on lowest need
  const recommendations = [];
  if (topNeed) {
    const label = topNeed.needLabel || topNeed.needKey;
    recommendations.push({
      type: "learn",
      needKey: topNeed.needKey,
      needLabel: label,
      questionId: topNeed.questionId,
      message: `Explore Learn & Grow content for ${label}`,
    });
    recommendations.push({
      type: "goal",
      needKey: topNeed.needKey,
      needLabel: label,
      questionId: topNeed.questionId,
      message: `Set a goal to improve ${label}`,
    });
    recommendations.push({
      type: "coach",
      needKey: topNeed.needKey,
      needLabel: label,
      questionId: topNeed.questionId,
      message: `Ask your coach about ${label}`,
    });
  }

  res.status(200).json({
    success: true,
    message: "Need-level report with recommendations",
    data: {
      assessmentId: latestAssessment._id,
      needScores: needScoresArray, // Array with questionId included
      categoryScores,
      lowestNeeds: lowestNeeds.map(n => ({
        needKey: n.needKey,
        needLabel: n.needLabel,
        score: n.score,
        category: n.category,
        questionId: n.questionId,
      })),
      learningByNeed,
      recommendations, // Merged from recommendations endpoint
      recommendedActions: recommendations, // Alias for backward compatibility
      primaryNeed: topNeed ? {
        needKey: topNeed.needKey,
        needLabel: topNeed.needLabel,
        score: topNeed.score,
        category: topNeed.category,
        questionId: topNeed.questionId,
      } : null,
      suggestedPrompt: "Which one of your needs would you like to develop more skills in?",
      completedAt: latestAssessment.createdAt || latestAssessment.completedAt,
    },
  });
});

// DEPRECATED: Use getNeedReport instead - merged into /api/assessment/needs-report
// Keeping for backward compatibility - calls the merged endpoint
export const getRecommendations = getNeedReport;

  export const downloadAssessmentPDF = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) throw new AppError("User not authenticated", 401);
  
    const latestAssessment = await UserAssessment.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
    if (!latestAssessment) throw new AppError("No assessment found", 404);
  
    const categoryScores = latestAssessment.categoryScores || {};
    const overallScore =
      latestAssessment.overallScore ??
      (Object.values(categoryScores).length
        ? Number(
            (
              Object.values(categoryScores).reduce((a, b) => a + b, 0) /
              Object.values(categoryScores).length
            ).toFixed(2)
          )
        : 0);
  
    // ---- Create PDF ----
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="assessment-summary.pdf"`
    );
    doc.pipe(res);
  
    doc.fontSize(20).text("Self-Actualization Assessment Summary", { align: "center" });
    doc.moveDown();
  
    doc.fontSize(12).text(`Date: ${new Date(latestAssessment.createdAt).toLocaleDateString()}`);
    doc.text(`User ID: ${userId}`);
    doc.moveDown();
  
    doc.fontSize(14).text("Category Scores", { underline: true });
    doc.moveDown(0.5);
  
    Object.entries(categoryScores).forEach(([cat, val]) => {
      doc.text(`${cat}: ${val}/7`);
    });
  
    doc.moveDown(1);
    doc.fontSize(14).text(`Overall Score: ${overallScore}/7`, { bold: true });
    doc.moveDown(1);
  
    // Optional: add chart legend / band descriptions
    const bands = [
      { label: "Dysfunctional / Extreme", range: [1, 2] },
      { label: "Getting By", range: [3, 4] },
      { label: "Thriving", range: [5, 6] },
      { label: "Maximizing", range: [7, 7] },
    ];
    doc.fontSize(12).text("Performance Bands:", { underline: true });
    bands.forEach((b) => doc.text(`${b.label}  (${b.range[0]}-${b.range[1]})`));
  
    doc.end();
  });