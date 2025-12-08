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
      enum: ["regular", "V", "Q"],
      default: "regular",
    },
    parentQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
      // For V/Q questions, this links to the parent question from section 1
    },
    sectionOrder: {
      type: Number,
      default: 0,
      // Order within the section for proper sequencing
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
