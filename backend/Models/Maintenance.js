const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: false
  },
  issue: {
    type: String,
    required: true
  },
  issueType: {
    type: String,
    enum: ['ac', 'plumbing', 'electrical', 'furniture', 'appliance', 'internet', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  },
  dueDate:    { type: Date },
  notes:      { type: String },
  resolution: { type: String },
  resolvedAt: { type: Date },
  roomNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);