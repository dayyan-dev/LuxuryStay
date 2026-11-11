const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  // Hotel Info
  hotelName:   { type: String, default: 'The Luxury Stay' },
  tagline:     { type: String, default: 'Where Comfort Meets Excellence' },
  story:       { type: String },
  mission:     { type: String },
  vision:      { type: String },

  // Meta
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('AboutUs', aboutUsSchema);