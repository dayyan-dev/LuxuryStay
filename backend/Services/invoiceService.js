const PDFDocument = require('pdfkit');

/**
 * Build the luxury invoice PDF for a booking.
 * Returns a Buffer so callers can stream it (download) or attach to email.
 * Styled with LuxuryStay brand identity (Charcoal #171717, Muted Gold red).
 *
 * @param {object} booking - populated Booking (roomId populated)
 * @param {object} opts    - { hotelName, hotelAddress, hotelEmail, taxPercent }
 * @returns {Promise<Buffer>}
 */
const buildInvoicePdf = async (booking, opts = {}) => {
  const hotelName = opts.hotelName || process.env.HOTEL_NAME || 'LuxuryStay Hospitality — Hotels & Resorts';
  const hotelAddress = opts.hotelAddress || process.env.HOTEL_ADDRESS || 'Club Road, Civil Lines, Karachi / Shahrah-e-Quaid-e-Azam, Lahore';
  const hotelEmail = opts.hotelEmail || process.env.HOTEL_EMAIL || 'reservations@theluxurystay.com';
  const taxPercent = Number.isFinite(parseFloat(opts.taxPercent)) ? parseFloat(opts.taxPercent) : 13;

  const room = booking.roomId || {};
  const invoiceNumber = `INV-${booking._id.toString().slice(-8).toUpperCase()}`;

  const subtotal = booking.totalAmount;
  const taxAmount = taxPercent > 0
    ? Math.round(subtotal - subtotal / (1 + taxPercent / 100))
    : 0;
  const netAmount = subtotal - taxAmount;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Luxury Brand Header ──
    doc
      .fillColor('#171717')
      .fontSize(22)
      .text('LUXURYSTAY HOSPITALITY', { align: 'left' })
      .moveDown(0.2);

    doc
      .fillColor('red')
      .fontSize(10)
      .text('PREMIER 5-STAR HOTELS & RESORTS — PAKISTAN', { align: 'left' })
      .moveDown(0.4);

    doc
      .fillColor('#666666')
      .fontSize(9)
      .text(hotelAddress, { align: 'left' })
      .text(`Email: ${hotelEmail}  |  UAN: +92 21 111 505 505`, { align: 'left' })
      .moveDown(1.5);

    // ── Invoice Title & Metadata ──
    doc
      .fillColor('#171717')
      .fontSize(16)
      .text('TAX INVOICE / GUEST FOLIO', { align: 'right' });

    doc
      .fontSize(9)
      .fillColor('#777777')
      .text(`Invoice No: ${invoiceNumber}`, { align: 'right' })
      .text(`Booking Ref: ${booking._id.toString().toUpperCase()}`, { align: 'right' })
      .text(`Date Issued: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right' })
      .moveDown(1.2);

    // ── Gold Accent Line ──
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('red').lineWidth(1.5).stroke();
    doc.moveDown(1);

    // ── Billed To (Guest Information) ──
    doc.fillColor('#171717').fontSize(11).text('BILLED TO GUEST:', { underline: false });
    doc.fontSize(10).fillColor('#333333')
      .text(`Name: ${booking.guestName || 'Valued Guest'}`)
      .text(`Email: ${booking.guestEmail || 'N/A'}`)
      .text(`Phone: ${booking.guestPhone || 'N/A'}`)
      .moveDown(1);

    // ── Reservation Details ──
    doc.fillColor('#171717').fontSize(11).text('RESERVATION BREAKDOWN:').moveDown(0.5);

    const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-GB');
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-GB');

    const rows = [
      ['Accommodations', `Room ${room?.roomNumber || '—'} (${(room?.type || 'Standard').toUpperCase()} Suite)`],
      ['Stay Dates', `${checkIn} to ${checkOut}`],
      ['Registered Guests', `${booking.guests} Guest(s)`],
      ['Payment Method', booking.paymentMethod === 'online' ? 'Online Payment (Verified)' : 'Cash / Card on Check-in'],
      ['Payment Status', (booking.paymentStatus || 'pending').toUpperCase()],
    ];

    if (booking.discountAmount > 0) {
      rows.push(['Promotional / Loyalty Discount', `- PKR ${booking.discountAmount.toLocaleString()}`]);
    }

    rows.forEach(([label, value]) => {
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(label, 50, doc.y, { continued: true, width: 260 })
        .fillColor('#171717')
        .text(value, { align: 'right' });
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E6DFD3').lineWidth(0.8).stroke();
    doc.moveDown(1);

    // ── Financial Breakdown ──
    doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Room Charges (Net Amount)', 50, doc.y, { continued: true, width: 260 })
      .fillColor('#171717')
      .text(`PKR ${netAmount.toLocaleString()}`, { align: 'right' });

    doc
      .fontSize(9)
      .fillColor('#666666')
      .text(`Sales Tax / GST (${taxPercent}%)`, 50, doc.y, { continued: true, width: 260 })
      .fillColor('#171717')
      .text(`PKR ${taxAmount.toLocaleString()}`, { align: 'right' });

    doc.moveDown(0.5);
    doc.moveTo(350, doc.y).lineTo(545, doc.y).strokeColor('red').lineWidth(1).stroke();
    doc.moveDown(0.5);

    doc
      .fontSize(13)
      .fillColor('#171717')
      .text(`Total Amount: PKR ${booking.totalAmount?.toLocaleString()}`, { align: 'right' })
      .moveDown(2);

    // ── Luxury Footer ──
    doc
      .fontSize(8)
      .fillColor('#888888')
      .text('Thank you for choosing LuxuryStay Hospitality. We look forward to serving you again.', { align: 'center' })
      .text('This is a verified computer-generated tax invoice. No signature required.', { align: 'center' });

    doc.end();
  });
};

module.exports = { buildInvoicePdf };
