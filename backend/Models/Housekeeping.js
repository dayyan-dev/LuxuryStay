const mongoose = require('mongoose');

const housekeepingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: false
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  cleaningStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  // New fields
  taskType: {
    type: String,
    enum: ['room_cleaning', 'deep_cleaning', 'linen_change', 'bathroom_cleaning', 'minibar_refill', 'guest_request'],
    default: 'room_cleaning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  notes: { type: String },
  dueDate: { type: Date },
  completedAt: { type: Date },
  guestRequest: { type: Boolean, default: false },
  roomNumber: { type: String },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Housekeeping', housekeepingSchema);