import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [160, "Title must be less than or equal to 160 characters"],
    },
    /**
     * Full article content (plain text or HTML/Markdown rendered by frontend)
     */
    content: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * Optional high-level category or topic for grouping in the app
     */
    category: {
      type: String,
      trim: true,
      maxlength: [80, "Category must be less than or equal to 80 characters"],
      default: null,
    },
    /**
     * Thumbnail / cover image for the article card
     */
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null,
    },
    /**
     * Estimated read time in minutes (e.g. 8 for "Read Time: 8 min")
     */
    readTimeMinutes: {
      type: Number,
      required: true,
      min: [1, "Read time must be at least 1 minute"],
    },
    /**
     * Flag to control visibility without hard-deleting the record.
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
     * Admin who created/last updated this article (optional, for audit).
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

articleSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
articleSchema.index({ title: 1 });
articleSchema.index({ category: 1, isActive: 1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;


