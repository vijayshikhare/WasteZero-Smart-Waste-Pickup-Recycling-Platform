const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
  },
  targetModel: {
    type: String,
    enum: ['User', 'Opportunity', 'Application', 'Message'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AdminLog', adminLogSchema);