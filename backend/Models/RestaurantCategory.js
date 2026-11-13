const mongoose = require('mongoose');

const RestaurantCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '#1B365D',
    },
    icon: {
      type: String,
      default: 'ri-restaurant-2-line',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestaurantCategory', RestaurantCategorySchema);
