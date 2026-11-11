const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false   // Admin se create karne par userId nahi hoga
  },
  // Admin se create karne par ye fields use honge
  guestName: { type: String },
  roomNumber: { type: String },
  serviceType: {
    type: String,
    enum: ['room_service', 'laundry', 'wake_up_call', 'transportation'],
    required: true
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);