const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO reference is required'],
      index: true, // fast lookup by NGO
    },

    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      minlength: [5, 'Title must be at least 5 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
      minlength: [20, 'Description must be at least 20 characters'],
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
      // Stored as relative path: /uploads/opportunities/xxx.jpg
      // Full URL constructed in frontend: `${API_BASE}${image}`
    },

    status: {
      type: String,
      enum: {
        values: ['open', 'closed', 'completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'open',
      index: true, // fast filter open/closed/completed
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ────────────────────────────────────────────────
// Indexes for performance
// ────────────────────────────────────────────────
opportunitySchema.index({ status: 1, createdAt: -1 }); // common sort: newest open first

// ────────────────────────────────────────────────
// Pre-save hook: clean required_skills
// ────────────────────────────────────────────────
opportunitySchema.pre('save', function (next) {
  if (this.isModified('required_skills') && Array.isArray(this.required_skills)) {
    this.required_skills = this.required_skills
      .map(skill => (typeof skill === 'string' ? skill.trim() : ''))
      .filter(skill => skill.length > 0);
  }
  next();
});

// ────────────────────────────────────────────────
// Virtual: populated NGO (optional — use .populate('ngo_id') in controller instead)
// ────────────────────────────────────────────────
// opportunitySchema.virtual('ngo', {
//   ref: 'User',
//   localField: 'ngo_id',
//   foreignField: '_id',
//   justOne: true,
// });

// ────────────────────────────────────────────────
// Method: check if user is the owner (NGO)
// ────────────────────────────────────────────────
opportunitySchema.methods.isOwnedBy = function (userId) {
  return this.ngo_id.toString() === userId.toString();
};

module.exports = mongoose.model('Opportunity', opportunitySchema);