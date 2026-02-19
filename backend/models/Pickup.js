const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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