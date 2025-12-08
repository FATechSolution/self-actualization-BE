import mongoose from "mongoose";

const questionLearningSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title must be less than or equal to 200 characters"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      // Can contain plain text, HTML, or Markdown (rendered by frontend)
    },
    learningType: {
      type: String,
      enum: ["health", "vitality", "general"],
      default: "general",
      // Type of learning content (health/vitality as mentioned in requirements)
    },
    /**
     * Optional thumbnail or image URL for the learning content
     */
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null,
    },
    /**
     * Estimated read time in minutes
     */
    readTimeMinutes: {
      type: Number,
      min: [1, "Read time must be at least 1 minute"],
      default: 5,
    },
    /**
     * Flag to control visibility
     */
    isActive: {
      type: Boolean,
      default: true,
    },
    /**
     * Admin who created/last updated this learning content (optional, for audit)
     */
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
questionLearningSchema.index({ questionId: 1, isActive: 1 });
questionLearningSchema.index({ learningType: 1, isActive: 1 });

// Ensure one learning content per question (can be updated, but not duplicated)
questionLearningSchema.index({ questionId: 1 }, { unique: true });

const QuestionLearning = mongoose.model("QuestionLearning", questionLearningSchema);

export default QuestionLearning;

