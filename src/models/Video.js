import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
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
     * e.g. "Calm the Racing Mind", "Mindfulness", etc.
     */
    category: {
      type: String,
      trim: true,
      maxlength: [80, "Category must be less than or equal to 80 characters"],
      default: null,
    },
    /**
     * Public URL or storage key to the video file
     * (Flutter app will use this to play/stream)
     */
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * Thumbnail image URL for the video card (screenshot/cover)
     */
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null,
    },
    /**
     * Total duration in seconds (e.g. 8 * 60 = 480 for "8 min")
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
     * Admin who created/last updated this video (optional, for audit).
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
videoSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
videoSchema.index({ title: 1 });
videoSchema.index({ category: 1, isActive: 1 });

const Video = mongoose.model("Video", videoSchema);

export default Video;


