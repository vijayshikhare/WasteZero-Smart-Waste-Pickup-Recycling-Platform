// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    opportunity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: [true, 'Opportunity reference is required'],
      index: true,
    },

    volunteer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer reference is required'],
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // Optional: note from NGO when accepting/rejecting
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ────────────────────────────────────────────────
// Compound unique index: prevent duplicate applications
// ────────────────────────────────────────────────
applicationSchema.index(
  { opportunity_id: 1, volunteer_id: 1 },
  { unique: true }
);

// ────────────────────────────────────────────────
// Pre-save hook — NO 'next()' — use async/await style
// ────────────────────────────────────────────────
applicationSchema.pre('save', async function () {
  // Only set reviewedAt when status changes from pending to accepted/rejected
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }

  // Optional: add more pre-save logic here (e.g. validation, auto-fill)
  // No 'next()' call needed!
});

// ────────────────────────────────────────────────
// Instance methods (helpers)
// ────────────────────────────────────────────────
applicationSchema.methods.isPending = function () {
  return this.status === 'pending';
};

applicationSchema.methods.isAccepted = function () {
  return this.status === 'accepted';
};

applicationSchema.methods.isRejected = function () {
  return this.status === 'rejected';
};

applicationSchema.methods.canBeReviewed = function () {
  return this.status === 'pending' && !this.reviewedAt;
};

module.exports = mongoose.model('Application', applicationSchema);