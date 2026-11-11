const transporter = require('../Config/email');

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    // Email failures must never crash a booking/payment flow — log and continue
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error.message);
    return false;
  }
};

module.exports = sendEmail;