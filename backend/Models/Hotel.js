const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tagline: {
    type: String,
    default: 'A premier luxury sanctuary',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.8,
  },
  reviewCount: {
    type: Number,
    default: 120,
  },
  startingPrice: {
    type: Number,
    required: true,
    default: 12000,
  },
  images: {
    type: [String],
    default: [],
  },
  facilities: {
    type: [String],
    default: [
      'Infinity Swimming Pool',
      'Executive Lounge',
      'Signature Spa & Wellness',
      '24/7 Fine Dining',
      'Valet Parking',
      'Fitness & Health Club',
      'Grand Banquet Hall',
      'High-Speed Wi-Fi',
      'Concierge Service',
      'Airport Chauffeur',
    ],
  },
  contactPhone: {
    type: String,
    default: '+92 21 111 505 505',
  },
  contactEmail: {
    type: String,
    default: 'reservations@theluxurystay.com',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'coming_soon'],
    default: 'active',
  },
}, { timestamps: true });

hotelSchema.index({ city: 1, startingPrice: 1, rating: -1 });

module.exports = mongoose.model('Hotel', hotelSchema);

