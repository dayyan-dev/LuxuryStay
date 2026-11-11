const cron = require('node-cron');

const Booking = require('../Models/Booking');
const Room = require('../Models/Room');

const sendEmail = require('../Services/emailService');

const {
  checkoutReminderTemplate,
} = require('../Utils/emailTemplates');

cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Running checkout reminder cron job...');

    const today = new Date();

    const bookings = await Booking.find({
      bookingStatus: { $in: ['confirmed', 'checked_in'] },
      checkOutReminderSent: { $ne: true }, // sirf wo bookings jinhe reminder abhi tak nahi gaya
    });

    for (const booking of bookings) {
      const checkout = new Date(booking.checkOutDate);
      const diffTime = checkout - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const room = await Room.findById(booking.roomId);

        await sendEmail({
          to: booking.guestEmail,
          subject: 'Checkout Reminder - Tomorrow is your checkout day',
          html: checkoutReminderTemplate({
            name: booking.guestName,
            roomNo: room?.roomNumber,
            checkOutDate: booking.checkOutDate,
          }),
        });

        // Flag set karo taake dobara na jaye
        await Booking.findByIdAndUpdate(booking._id, { checkOutReminderSent: true });

        console.log(`Checkout reminder sent to ${booking.guestEmail}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
});
