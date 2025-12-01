import mongoose from "mongoose";

const audioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [120, "Title must be less than or equal to 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be less than or equal to 500 characters"],
    },
    /**
     * Optional high-level category or topic for grouping in the app
     * e.g. "Daily Motivation", "Mindfulness", etc.
     */
    category: {
      type: String,
      trim: true,
      maxlength: [80, "Category must be less than or equal to 80 characters"],
      default: null,
    },
    /**
     * Public URL or storage key to the audio file
     * (Flutter app will use this to stream/play)
     */
    audioUrl: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * Optional thumbnail/icon URL shown in the list (like in the Figma design)
     */
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null,
    },
    /**
     * Total duration in seconds (e.g. 10*60 + 12 = 612 for 10:12)
     * Frontend can format to mm:ss.
     */
    durationSeconds: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 second"],
    },
    /**
     * Flag to control visibility in the app without hard-deleting the record.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
    /**
     * Optional ordering field to control list order (lower comes first).
     */
    sortOrder: {
      type: Number,
      default: 0,
    },
    /**
     * Admin who created/last updated this audio (optional, for audit).
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

// Basic indexes to support common queries
audioSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
audioSchema.index({ title: 1 });
audioSchema.index({ category: 1, isActive: 1 });

const Audio = mongoose.model("Audio", audioSchema);

export default Audio;


