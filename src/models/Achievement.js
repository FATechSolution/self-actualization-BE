import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Total points accumulated from all activities
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Current badge level (1 = Bronze, 2 = Silver, 3 = Gold, 4 = Platinum, etc.)
    currentBadgeLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Current badge name
    currentBadgeName: {
      type: String,
      default: "Bronze",
      enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
    },
    // Focus streak - consecutive days with activity
    focusStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Last activity date for streak calculation
    lastActivityDate: {
      type: Date,
      default: null,
    },
    // Individual achievement unlocks
    unlockedAchievements: [
      {
        achievementId: {
          type: String,
          required: true,
        },
        achievementName: {
          type: String,
          required: true,
        },
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
        badgeType: {
          type: String,
          enum: ["bronze", "silver", "gold", "platinum", "diamond"],
          default: "bronze",
        },
      },
    ],
    // Activity counters for point calculation
    activityCounts: {
      assessmentsCompleted: { type: Number, default: 0 },
      goalsCompleted: { type: Number, default: 0 },
      reflectionsCreated: { type: Number, default: 0 },
      daysActive: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for faster queries
achievementSchema.index({ userId: 1 });
achievementSchema.index({ totalPoints: -1 }); // For leaderboards

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;

