const cron = require('node-cron');

const Booking = require('../Models/Booking');
const Room = require('../Models/Room');

const sendEmail = require('../Services/emailService');
const { checkInReminderTemplate } = require('../Utils/emailTemplates');

cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running check-in reminder cron job...');

    const bookings = await Booking.find({
      bookingStatus: { $in: ['confirmed', 'pending'] },
      checkInReminderSent: { $ne: true }, // sirf wo bookings jinhe reminder abhi tak nahi gaya
    });

    const today = new Date();

    for (const booking of bookings) {
      const checkIn = new Date(booking.checkInDate);
      const diffTime = checkIn - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1 din pehle
      if (diffDays === 1) {
        const room = await Room.findById(booking.roomId);

        await sendEmail({
          to: booking.guestEmail,
          subject: 'Check-In Reminder — Tomorrow is Your Check-In Day',
          html: checkInReminderTemplate({
            name: booking.guestName,
            roomNo: room?.roomNumber,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
          }),
        });

        // Flag set karo taake dobara na jaye
        await Booking.findByIdAndUpdate(booking._id, { checkInReminderSent: true });

        console.log(`Check-in reminder sent to ${booking.guestEmail}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
});
