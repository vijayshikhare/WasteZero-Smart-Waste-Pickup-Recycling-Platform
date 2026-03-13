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
      index: true, // fast filter by status
    },

    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: null,
      // Volunteer can write a short motivation or availability note
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
    reviewNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Review note cannot exceed 500 characters'],
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
  { unique: true, message: 'You have already applied to this opportunity' }
);

// ────────────────────────────────────────────────
// Pre-save hook (modern async/await style - no next())
// ────────────────────────────────────────────────
applicationSchema.pre('save', async function () {
  // Automatically set reviewedAt when status changes from pending
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }

  // Optional: add more logic here (e.g. validate message length, etc.)
});

// ────────────────────────────────────────────────
// Instance methods (useful helpers)
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

applicationSchema.methods.isReviewed = function () {
  return !!this.reviewedAt;
};

// ────────────────────────────────────────────────
// Virtuals (optional - add if needed)
// ────────────────────────────────────────────────
// applicationSchema.virtual('volunteer', {
//   ref: 'User',
//   localField: 'volunteer_id',
//   foreignField: '_id',
//   justOne: true,
// });

module.exports = mongoose.model('Application', applicationSchema);