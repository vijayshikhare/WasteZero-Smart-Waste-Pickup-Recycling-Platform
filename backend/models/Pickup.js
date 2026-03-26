const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  // user who requested or owns the pickup (usually a volunteer)
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // optional NGO assignment if needed in future
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  wasteType: {
    type: String,
    enum: ['plastic', 'paper', 'metal', 'organic', 'other'],
    required: true,
  },
  quantityKg: {
    type: Number,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'collected', 'completed'],
    default: 'pending',
  },
  scheduledDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Pickup', pickupSchema);