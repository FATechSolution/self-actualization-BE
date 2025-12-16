import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "goal_completed",
        "goal_reminder",
        "assessment_reminder",
        "test",
        "general",
      ],
      default: "general",
      index: true,
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // FCM message ID (if notification was sent via FCM)
    fcmMessageId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Convert Map to Object for JSON response
        if (ret.data && ret.data instanceof Map) {
          ret.data = Object.fromEntries(ret.data);
        }
        return ret;
      },
    },
  }
);

// Indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

