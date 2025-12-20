
import mongoose from "mongoose";

const userAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responses: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedOption: {
          type: Number, // e.g., 1–7
          required: true,
        },
        category: {
          type: String,
          enum: ["Survival", "Safety", "Social", "Self", "Meta-Needs"],
          required: true,
        },
        needKey: {
          type: String,
          default: null,
        },
        needLabel: {
          type: String,
          default: null,
        },
        sectionType: {
          type: String,
          enum: ["regular", "V", "Q", "Quality", "Volume"],
          default: "regular",
        },
        parentQuestionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          default: null,
        },
        // Quality and Volume sub-question responses (for main questions only)
        qualityResponse: {
          type: Number, // 1-7 rating for quality sub-question
          default: null,
        },
        volumeResponse: {
          type: Number, // 1-7 rating for volume sub-question
          default: null,
        },
      },
    ],
    categoryScores: {
      Survival: { type: Number, default: 0 },
      Safety: { type: Number, default: 0 },
      Social: { type: Number, default: 0 },
      Self: { type: Number, default: 0 },
      "Meta-Needs": { type: Number, default: 0 },
    },
    needScores: {
      type: Map,
      of: new mongoose.Schema(
        {
          score: { type: Number, default: 0 },
          needLabel: { type: String, default: null },
          category: { type: String, default: null },
        },
        { _id: false }
      ),
      default: {},
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Calculate average category scores before saving (optional helper)
userAssessmentSchema.methods.calculateScores = function () {
  const totals = {};
  const counts = {};

  for (const resp of this.responses) {
    if (!totals[resp.category]) {
      totals[resp.category] = 0;
      counts[resp.category] = 0;
    }
    totals[resp.category] += resp.selectedOption;
    counts[resp.category] += 1;
  }

  const scores = {};
  for (const cat in totals) {
    scores[cat] = +(totals[cat] / counts[cat]).toFixed(2);
  }

  this.categoryScores = scores;
  const validScores = Object.values(scores).filter((v) => !isNaN(v));
  this.overallScore =
    validScores.length > 0
      ? +(validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : 0;
};

const UserAssessment = mongoose.model("UserAssessment", userAssessmentSchema);
export default UserAssessment;
