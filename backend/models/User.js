// models/User.js
// All secrets and sensitive configuration must be loaded from environment variables only.
// Do not hardcode secrets or tokens in this file.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // hidden by default in queries
    },

    role: {
      type: String,
      enum: ['volunteer', 'ngo', 'admin'],
      default: 'volunteer',
      index: true,
    },

    // ── New fields for profile editing ──
    address: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },

    profilePicture: {
      type: String,
      default: null, // will be e.g. "/uploads/123456789-profile.jpg"
      trim: true,
    },

    // Existing optional fields (kept as-is)
    location: {
      type: String,
      default: '',
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },

    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },

    suspensionReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Suspension reason cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optional: virtual for full name or other computed fields (example)
userSchema.virtual('initial').get(function () {
  return this.name ? this.name.charAt(0).toUpperCase() : '?';
});

// Helper method - useful in controllers
userSchema.methods.hasPassword = function () {
  return !!this.password;
};

// Optional: method to return safe/public version of user
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);