const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  message: { type: String, required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead:  { type: Boolean, default: false },
  // booking, order, maintenance, service — icon ke liye
  type: {
    type: String,
    enum: ['booking', 'order', 'maintenance', 'service', 'general'],
    default: 'general'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);