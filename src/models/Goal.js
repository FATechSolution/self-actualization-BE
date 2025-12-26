import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: false, trim: true }, // Auto-set from needLabel if not provided
    description: { type: String, maxlength: 300 }, // Kept for backward compatibility
    
    // Date fields now optional (for backward compatibility)
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    
    type: {
      type: String,
      enum: ["Survival", "Safety", "Social", "Self", "Meta-Needs"],
      required: true,
    },
    
    // Need-level metadata (linked to assessment needs)
    needKey: {
      type: String,
      trim: true,
      default: null,
      // machine-friendly slug, e.g., "sleep", "exercise"
    },
    needLabel: {
      type: String,
      trim: true,
      default: null,
      // human-friendly label, e.g., "Sleep", "Exercise"
    },
    needOrder: {
      type: Number,
      default: null,
      // order of the need within the category
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
      // Reference to the question that represents this need
    },
    
    // NEW: Level-based progress tracking
    currentLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      default: 1,
      // User's current satisfaction level on a scale of 1-7
    },
    targetLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      default: 7,
      // User's target satisfaction level on a scale of 1-7
    },
    userNotes: {
      type: String,
      default: "",
      maxlength: 500,
      // Open text field for user to add personal notes about the goal
    },
    
    isCompleted: { type: Boolean, default: false },
    completedAt: {
      type: Date,
      default: null,
      // Timestamp when user marked the goal as complete
    },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
