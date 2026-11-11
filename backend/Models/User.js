const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'kitchen', 'guest'],
    default: 'guest'
  },
  address: {
    type: String
  },
  bookings: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Booking'
}],
  // walk-in = admin ne booking ki, online = user ne website se booking ki
  guestType: {
    type: String,
    enum: ['walk-in', 'online'],
    default: 'online'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'suspended'],
    default: 'active'
  },
  refreshToken: {
    type: String,
    default: null
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorVerified: {
    type: Boolean,
    default: false
  },
  // ── GDPR / privacy consent ──
  // Informed consent captured at registration. Guests may withdraw it later
  // (Profile → Privacy); withdrawing anonymises personal data and blocks login.
  consentAccepted: {
    type: Boolean,
    default: false,
  },
  consentAcceptedAt: {
    type: Date,
    default: null,
  },
  consentPolicyVersion: {
    type: String,
    default: null,
  },
  // ── Email OTP verification (guest registration) ──
  // Existing / staff accounts default to verified so login is not broken.
  isEmailVerified: {
    type: Boolean,
    default: true,
  },
  emailOtpHash: {
    type: String,
    default: null,
  },
  emailOtpExpires: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);