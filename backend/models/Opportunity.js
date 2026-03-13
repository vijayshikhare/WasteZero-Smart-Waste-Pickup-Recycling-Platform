const mongoose = require('mongoose');

console.log('[Opportunity Model] File loaded - initializing schema');

const opportunitySchema = new mongoose.Schema(
  {
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO reference is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },

    required_skills: {
      type: [String],
      default: [],
    },

    duration: {
      type: String,
      trim: true,
      maxlength: [100, 'Duration description too long'],
      default: 'Flexible',
    },

    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location too long'],
      default: 'Not specified',
    },

    image: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['open', 'closed', 'completed'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────
opportunitySchema.index({ ngo_id: 1, status: 1, createdAt: -1 });
opportunitySchema.index({ status: 1, createdAt: -1 });

// ────────────────────────────────────────────────
// Virtuals
// ────────────────────────────────────────────────
opportunitySchema.virtual('applicationsCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'opportunity_id',
  count: true,
});

// ────────────────────────────────────────────────
// Pre-save hook – modern async style (no next() needed)
// ────────────────────────────────────────────────
opportunitySchema.pre('save', async function () {
  console.log('[PRE-SAVE HOOK] Starting pre-save middleware');

  // Only run if required_skills was modified and is an array
  if (this.isModified('required_skills') && Array.isArray(this.required_skills)) {
    console.log('[PRE-SAVE] Cleaning required_skills array');

    const cleaned = this.required_skills
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter((s) => s.length > 0);

    // Deduplicate case-insensitively
    const seen = new Set();
    this.required_skills = cleaned.filter((s) => {
      const lower = s.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    console.log('[PRE-SAVE] Cleaned skills:', this.required_skills);
  }

  // No next() needed in async pre hooks – Mongoose waits for promise resolution
  console.log('[PRE-SAVE HOOK] Completed successfully');
});

// ────────────────────────────────────────────────
// Instance methods
// ────────────────────────────────────────────────
opportunitySchema.methods.isOwnedBy = function (userId) {
  return this.ngo_id.toString() === userId.toString();
};

console.log('[Opportunity Model] Schema and middleware fully registered');

module.exports = mongoose.model('Opportunity', opportunitySchema);