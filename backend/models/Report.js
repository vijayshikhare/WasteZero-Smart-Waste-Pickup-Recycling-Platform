// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    reportType: {
      type: String,
      enum: ['opportunity', 'user', 'message', 'inappropriate_content'],
      required: true,
      index: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'fake_profile',
        'inappropriate_content',
        'misleading_information',
        'scam',
        'violence',
        'other',
      ],
      required: true,
    },

    description: {
      type: String,
      maxlength: [2000, 'Report description cannot exceed 2000 characters'],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },

    adminNotes: {
      type: String,
      default: '',
    },

    actionTaken: {
      type: String,
      enum: ['none', 'warning', 'suspension', 'deletion', 'other'],
      default: 'none',
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    evidence: [
      {
        type: String,
        maxlength: [500, 'Evidence URL too long'],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reportSchema.index({ reportType: 1, status: 1, createdAt: -1 });
reportSchema.index({ targetId: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
