import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 300 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
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
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
