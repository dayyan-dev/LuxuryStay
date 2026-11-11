const mongoose = require('mongoose');

const guestProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Personal preferences
  preferences: {
    roomType:     { type: String, default: '' },       // single, double, suite
    floorLevel:   { type: String, default: '' },       // low, high, any
    pillowType:   { type: String, default: '' },       // soft, firm, any
    dietaryNeeds: { type: String, default: '' },       // vegetarian, halal, none
    extraBlanket: { type: Boolean, default: false },
    quietRoom:    { type: Boolean, default: false },
    notes:        { type: String, default: '' },       // staff notes
  },

  // Special dates
  birthday:     { type: Date, default: null },
  anniversary:  { type: Date, default: null },

  // VIP status
  isVIP:        { type: Boolean, default: false },
  vipReason:    { type: String, default: '' },

  // Loyalty points
  loyaltyPoints: { type: Number, default: 0 },
  totalStays:    { type: Number, default: 0 },
  totalSpent:    { type: Number, default: 0 },

  // Tags
  tags: [{ type: String }], // ['frequent', 'corporate', 'honeymoon']

}, { timestamps: true });

module.exports = mongoose.model('GuestProfile', guestProfileSchema);