const mongoose = require('mongoose');

const hotelServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: { type: String },
  category: {
    type: String,
    enum: ['recreation', 'dining', 'wellness', 'business', 'transport', 'other'],
    default: 'other'
  },
  icon:     { type: String },   // emoji ya icon class
  image:    { type: String },   // uploaded image path
  timing:   { type: String },   // e.g. "6:00 AM - 10:00 PM"
  price:    { type: String },   // e.g. "Free" ya "PKR 500"
  isActive: { type: Boolean, default: true },
  order:    { type: Number,  default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('HotelService', hotelServiceSchema);