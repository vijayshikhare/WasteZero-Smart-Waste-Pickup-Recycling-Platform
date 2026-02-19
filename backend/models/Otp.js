const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true, // good for fast lookup by email
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index: document auto-deletes when expiresAt is reached
      index: { expires: '0s' }, // '0s' is more explicit than '0'
    },
    // Optional but very useful for debugging
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '10m', // optional extra safety: auto-delete after 10 min even if expiresAt is missing
    },
  },
  {
    timestamps: false, // we already have createdAt
  }
);

// Optional: index on email + expiresAt for faster queries
otpSchema.index({ email: 1, expiresAt: 1 });

module.exports = mongoose.model('Otp', otpSchema);