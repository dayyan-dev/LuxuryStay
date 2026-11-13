const mongoose = require("mongoose");

const RestaurantMenu = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  description: String,

  price: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  image: String,

  isAvailable: {
    type: Boolean,
    default: true
  },

  // Dietary tags — spicy, veg, non-veg, halal
  dietaryTags: {
    type: [String],
    enum: ['spicy', 'veg', 'non-veg', 'halal'],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model("Menu", RestaurantMenu);