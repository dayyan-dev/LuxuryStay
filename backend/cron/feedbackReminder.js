const cron = require('node-cron');

const Booking = require('../Models/Booking');
const Room = require('../Models/Room');

const sendEmail = require('../Services/emailService');

cron.schedule('0 10 * * *', async () => {

  try {

    console.log('Running feedback reminder cron job...');

    const bookings = await Booking.find({
      bookingStatus: 'completed'
    });

    const today = new Date();

    for (const booking of bookings) {

      const checkout = new Date(booking.checkOutDate);

      // Difference in days
      const diffTime = today - checkout;

      const diffDays = Math.ceil(
        diffTime / (1000 * 60 * 60 * 24)
      );

      // Send after 1 day
      if (diffDays === 1) {

        const room = await Room.findById(booking.roomId);

        await sendEmail({

          to: booking.guestEmail,

          subject: 'How was your stay?',

          html: `

          <div style="
            background:#f4f4f4;
            padding:40px;
            font-family:Arial;
          ">

            <div style="
              max-width:600px;
              margin:auto;
              background:white;
              border-radius:12px;
              padding:30px;
            ">

              <div style="
                text-align:center;
                margin-bottom:20px;
              ">

                <h1 style="color:#4f46e5;">
                  Thank You For Staying With Us
                </h1>

              </div>

              <p>Hello ${booking.guestName},</p>

              <p>
                We hope you enjoyed your stay in Room ${room.roomNumber}.
              </p>

              <p>
                Your feedback means a lot to us.
              </p>

              <div style="
                text-align:center;
                margin-top:30px;
              ">

                <a href="http://localhost:3000/review/${booking._id}"

                  style="
                    background:#4f46e5;
                    color:white;
                    padding:14px 24px;
                    text-decoration:none;
                    border-radius:8px;
                    display:inline-block;
                  "
                >

                  Leave Review

                </a>

              </div>

              <p style="
                margin-top:30px;
                color:gray;
                font-size:14px;
              ">

                Thank you for choosing our hotel.

              </p>

            </div>

          </div>

          `,
        });

        console.log(
          `Feedback email sent to ${booking.guestEmail}`
        );
      }
    }

  } catch (error) {
    console.log(error);
  }
});