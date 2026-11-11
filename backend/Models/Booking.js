const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  guestName: {
    type: String
  },

  guestPhone: {
    type: String
  },

  guestEmail: {
    type: String
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },

  checkInDate: {
    type: Date,
    required: true
  },

  checkOutDate: {
    type: Date,
    required: true
  },

  guests: {
    type: Number,
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  bookingStatus: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'checked_in',
      'checked_out',
      'completed',
      'cancelled'
    ],
    default: 'pending'
  },

  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    default: 'cash'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },

  specialRequests: {
    type: String
  },
  promoCode: {
    type: String,
    default: null,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
redeemedPoints: {
  type: Number,
  default: 0,
},

// Loyalty points earned tracking — points sirf tab count hote hain jab
// payment "paid" ho jaye, aur agar booking cancel ho to wapis le liye jate hain
loyaltyPointsAwarded: {
  type: Boolean,
  default: false,
},
loyaltyPointsEarned: {
  type: Number,
  default: 0,
},

// Reminder emails dobara na jayen isliye tracking flags
checkInReminderSent: {
  type: Boolean,
  default: false,
},
checkOutReminderSent: {
  type: Boolean,
  default: false,
},

// Duplicate feedback rokne ke liye
feedbackGiven: {
  type: Boolean,
  default: false,
},

// Invoice email tracking — duplicate send rokne ke liye (Enhancement C)
invoiceEmailed: {
  type: Boolean,
  default: false,
},
invoiceEmailedAt: {
  type: Date,
  default: null,
},

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);