const Booking = require('../Models/Booking');
const GuestProfile = require('../Models/GuestProfile');

// Rs 100 = 1 loyalty point
const POINTS_RATE = 100;

// ========================
// AWARD POINTS
// Booking ke "paid" hone par call karo (booking creation, admin payment
// record, status update, ya dedicated mark-as-paid — kahin se bhi).
// Idempotent hai: agar pehle se award ho chuke hain to dobara nahi denge.
// ========================
const awardLoyaltyPoints = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking || !booking.userId) return; // guest-only bookings (no account) points ke eligible nahi

  const payableAmount = Math.max(0, booking.totalAmount || 0);
  const pointsEarned = Math.floor(payableAmount / POINTS_RATE);
  if (pointsEarned <= 0) return;

  // Atomic guard — agar do requests ek sath aayen to bhi points sirf ek dafa milein
  const claimed = await Booking.findOneAndUpdate(
    { _id: bookingId, loyaltyPointsAwarded: { $ne: true } },
    { loyaltyPointsAwarded: true, loyaltyPointsEarned: pointsEarned },
    { new: true }
  );
  if (!claimed) return; // already awarded pehle se

  await GuestProfile.findOneAndUpdate(
    { userId: booking.userId },
    {
      $inc: { loyaltyPoints: pointsEarned },
      $setOnInsert: { userId: booking.userId },
    },
    { upsert: true }
  );
};

// ========================
// REVERSE POINTS
// Booking cancel hone par call karo (agar points award ho chuke thay)
// ========================
const reverseLoyaltyPoints = async (bookingId) => {
  const claimed = await Booking.findOneAndUpdate(
    { _id: bookingId, loyaltyPointsAwarded: true },
    { loyaltyPointsAwarded: false, loyaltyPointsEarned: 0 }
  );
  if (!claimed || !claimed.userId) return;

  await GuestProfile.findOneAndUpdate(
    { userId: claimed.userId },
    { $inc: { loyaltyPoints: -(claimed.loyaltyPointsEarned || 0) } }
  );
};

module.exports = { awardLoyaltyPoints, reverseLoyaltyPoints, POINTS_RATE };
