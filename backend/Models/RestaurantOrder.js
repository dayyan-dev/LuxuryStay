const mongoose = require('mongoose');

const restaurantOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestName: String,
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  estimatedTime: { type: Number, default: 20 },
  roomNumber: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('RestaurantOrder', restaurantOrderSchema);
