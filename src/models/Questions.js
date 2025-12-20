import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    answerOptions: {
      type: [String], // e.g., ["1 - Not at all true", "2 - Rarely true", ...]
      required: true,
    },
    correctAnswer: {
      type: String,
      default: null,
    },
    pointValue: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["Survival", "Safety", "Social", "Self", "Meta-Needs"],
      required: true,
    },
    questionType: {
      type: String,
      enum: ["Multiple Choice - Horizontal", "Multiple Choice - Vertical"],
      default: "Multiple Choice - Horizontal",
    },
    // Section metadata for V/Q question flow
    section: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
      // 1 = First section (regular questions)
      // 2 = V section (Vitality questions about first section)
      // 3 = Q section (Quality questions about first set)
    },
    sectionType: {
      type: String,
      enum: ["regular", "V", "Q", "Quality", "Volume"],
      default: "regular",
      // "V" and "Q" are legacy, new questions use "Quality" and "Volume"
    },
    parentQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
      // For V/Q/Quality/Volume questions, this links to the parent question from section 1
    },
    // Quality Sub-Question (customized for each need)
    qualitySubQuestion: {
      questionText: {
        type: String,
        trim: true,
        default: null,
        // e.g., "How would you rate the quality of your sleep last night?"
      },
      ratingOptions: {
        type: [String],
        default: [],
        // Custom rating options for this specific need's quality
        // e.g., ["1 = Extremely poor (restless, frequently waking, unrefreshing)", ...]
      },
    },
    // Volume Sub-Question (customized for each need)
    volumeSubQuestion: {
      questionText: {
        type: String,
        trim: true,
        default: null,
        // e.g., "How many hours of sleep did you get last night?"
      },
      ratingOptions: {
        type: [String],
        default: [],
        // Custom rating options for this specific need's volume
        // e.g., ["1 = Less than 4 hours", "2 = 4-5 hours", ...]
      },
    },
    sectionOrder: {
      type: Number,
      default: 0,
      // Order within the section for proper sequencing
    },
    // Need-level metadata (e.g., sleep, nutrition, purpose)
    needKey: {
      type: String,
      trim: true,
      default: null,
      // machine-friendly slug, e.g., "sleep", "nutrition"
    },
    needLabel: {
      type: String,
      trim: true,
      default: null,
      // human-friendly label, e.g., "Sleep", "Nutrition"
    },
    needOrder: {
      type: Number,
      default: 0,
      // optional ordering within a category
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ needKey: 1, section: 1, sectionType: 1 });
questionSchema.index({ category: 1, needKey: 1 });
questionSchema.index({ section: 1, sectionOrder: 1 });

const Question = mongoose.model("Question", questionSchema);
export default Question;
