const mongoose = require('mongoose');
const Booking = require('./Models/Booking');
const GuestProfile = require('./Models/GuestProfile');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const bookings = await Booking.find({ 
    paymentStatus: 'paid', 
    userId: { $ne: null } 
  });
  
  for (const b of bookings) {
    const points = Math.floor(b.totalAmount / 100);
    await GuestProfile.findOneAndUpdate(
      { userId: b.userId },
      { $inc: { loyaltyPoints: points }, $setOnInsert: { userId: b.userId } },
      { upsert: true }
    );
    console.log('Points added:', b._id, '->', points, 'points');
  }

  console.log('✅ Done!');
  mongoose.disconnect();
});