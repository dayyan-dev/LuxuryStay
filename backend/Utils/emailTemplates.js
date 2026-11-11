// =====================================================
// emailTemplates.js — Sab email templates ek jaisi
// branded design ke sath (consistent look)
// =====================================================

// ── Shared wrapper design — ye sab templates use karte hain ──
const emailWrapper = ({ headerColor, headerTitle, headerEmoji, bodyContent, footerNote }) => {
  return `
    <div style="background:#f4f4f7; padding:40px 20px; font-family:Arial, sans-serif;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <div style="background:${headerColor}; padding:28px 30px; text-align:center;">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">
            ${headerEmoji} ${headerTitle}
          </h1>
        </div>

        <div style="padding:30px;">
          ${bodyContent}
        </div>

        <div style="background:#f9f9fb; padding:18px 30px; text-align:center; border-top:1px solid #eee;">
          <p style="color:#888; font-size:13px; margin:0;">
            ${footerNote || 'Thank you for choosing our hotel.'}
          </p>
        </div>

      </div>
    </div>
  `;
};

// ── Reusable details table ──
const detailsTable = (rows) => {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 0; color:#666; border-bottom:1px solid #f0f0f0;">${label}</td>
        <td style="padding:10px 0; color:#222; font-weight:600; text-align:right; border-bottom:1px solid #f0f0f0;">${value}</td>
      </tr>`
    )
    .join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${rowsHtml}</table>`;
};

// ============================================================
// BOOKING CONFIRMATION — status ke hisab se sahi message
// ============================================================
const bookingConfirmationTemplate = (booking) => {
  const isConfirmed = booking.bookingStatus === 'confirmed';

  const headerTitle = isConfirmed ? 'Booking Confirmed' : 'Booking Received';
  const headerEmoji = isConfirmed ? '✅' : '📩';
  const headerColor = isConfirmed ? '#16a34a' : '#f59e0b';

  const introText = isConfirmed
    ? `Great news! Your booking has been confirmed and payment has been received.`
    : `We've received your booking request. It is currently <strong>pending payment/confirmation</strong>. We'll notify you once it's confirmed.`;

  const body = `
    <p style="color:#333; font-size:15px;">Dear ${booking.name},</p>
    <p style="color:#555; font-size:14px; line-height:1.6;">${introText}</p>
    <h3 style="color:#222; font-size:16px; margin-top:24px;">Booking Details</h3>
    ${detailsTable([
      ['Room Number', booking.roomNo],
      ['Check-In', booking.checkInDate],
      ['Check-Out', booking.checkOutDate],
      ['Total Price', `Rs. ${booking.totalPrice}`],
      ['Payment Mode', booking.paymentMethod],
      ['Payment Status', booking.paymentStatus],
    ])}
  `;

  return emailWrapper({ headerColor, headerTitle, headerEmoji, bodyContent: body });
};

// ============================================================
// CANCELLATION
// ============================================================
const cancellationTemplate = (booking) => {
  const body = `
    <p style="color:#333; font-size:15px;">Hello ${booking.name},</p>
    <p style="color:#555; font-size:14px; line-height:1.6;">Your booking has been cancelled successfully.</p>
    ${detailsTable([
      ['Room Number', booking.roomNo],
      ['Check-In', booking.checkInDate],
      ['Check-Out', booking.checkOutDate],
    ])}
    <p style="color:#888; font-size:13px; margin-top:20px;">If this was a mistake, please contact support.</p>
  `;

  return emailWrapper({
    headerColor: '#dc2626',
    headerTitle: 'Booking Cancelled',
    headerEmoji: '❌',
    bodyContent: body,
  });
};

// ============================================================
// CHECK-IN REMINDER
// ============================================================
const checkInReminderTemplate = (booking) => {
  const body = `
    <p style="color:#333; font-size:15px;">Hello ${booking.name},</p>
    <p style="color:#555; font-size:14px; line-height:1.6;">This is a friendly reminder that your check-in is <strong>tomorrow</strong>. We look forward to welcoming you!</p>
    ${detailsTable([
      ['Room Number', booking.roomNo],
      ['Check-In Date', booking.checkInDate],
      ['Check-Out Date', booking.checkOutDate],
      ['Payment Status', booking.paymentStatus],
      ['Payment Mode', booking.paymentMethod],
    ])}
  `;

  return emailWrapper({
    headerColor: '#4f46e5',
    headerTitle: 'Check-In Reminder',
    headerEmoji: '🏨',
    bodyContent: body,
  });
};

// ============================================================
// CHECKOUT REMINDER
// ============================================================
const checkoutReminderTemplate = (booking) => {
  const body = `
    <p style="color:#333; font-size:15px;">Hello ${booking.name},</p>
    <p style="color:#555; font-size:14px; line-height:1.6;">This is a reminder that <strong>tomorrow is your checkout day</strong>. We hope you're enjoying your stay!</p>
    ${detailsTable([
      ['Room Number', booking.roomNo],
      ['Checkout Date', booking.checkOutDate],
    ])}
  `;

  return emailWrapper({
    headerColor: '#0891b2',
    headerTitle: 'Checkout Reminder',
    headerEmoji: '🧳',
    bodyContent: body,
    footerNote: 'We hope you enjoyed your stay with us.',
  });
};

module.exports = {
  bookingConfirmationTemplate,
  cancellationTemplate,
  checkoutReminderTemplate,
  checkInReminderTemplate,
};
