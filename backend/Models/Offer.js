const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  subtitle: {
    type: String,
    default: 'Exclusive LuxuryStay Privilege',
  },
  description: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minNights: {
    type: Number,
    default: 1,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  },
  badge: {
    type: String,
    default: 'Special Offer',
  },
  terms: {
    type: [String],
    default: [
      'Subject to room availability at the time of booking.',
      'Cannot be combined with any other promotional package.',
      'Valid for direct bookings only.',
    ],
  },
  applicableHotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

offerSchema.index({ code: 1, isActive: 1, validUntil: 1 });

module.exports = mongoose.model('Offer', offerSchema);

