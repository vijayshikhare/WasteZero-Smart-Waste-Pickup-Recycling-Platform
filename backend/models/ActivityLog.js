// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    userName: {
      type: String,
      required: true,
    },

    userRole: {
      type: String,
      enum: ['volunteer', 'ngo', 'admin'],
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        'login',
        'logout',
        'profile_update',
        'opportunity_created',
        'opportunity_updated',
        'opportunity_deleted',
        'application_submitted',
        'application_accepted',
        'application_rejected',
        'pickup_scheduled',
        'pickup_completed',
        'message_sent',
        'user_suspended',
        'user_activated',
        'opportunity_post_removed',
        'report_viewed',
      ],
      required: true,
      index: true,
    },

    description: {
      type: String,
      default: '',
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    targetType: {
      type: String,
      enum: ['user', 'opportunity', 'application', 'pickup', 'message', 'report'],
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
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

// Indexes for efficient querying
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ userRole: 1, action: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
