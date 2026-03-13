// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: [200, 'Notification title cannot exceed 200 characters'],
    },

    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Notification message cannot exceed 1000 characters'],
    },

    type: {
      type: String,
      enum: [
        'application_update',
        'opportunity_match',
        'message_received',
        'pickup_reminder',
        'opportunity_closed',
        'user_suspended',
        'system_alert',
      ],
      required: true,
      index: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedType: {
      type: String,
      enum: ['opportunity', 'application', 'message', 'pickup', 'user'],
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    actionUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
