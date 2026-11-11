const Payment = require('../Models/Payment');
const Booking = require('../Models/Booking');
const auditLog = require('../Services/auditLogService'); // ✅ ADD
const { awardLoyaltyPoints } = require('../Services/loyaltyService');

// ========================
// CREATE PAYMENT
// ========================
const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.paymentStatus === 'paid') return res.status(400).json({ message: 'Booking already paid' });

    const payment = await Payment.create({
      bookingId,
      amount: booking.totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      transactionId: 'TXN' + Date.now(),
    });

    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });

    // Loyalty points award karo
    await awardLoyaltyPoints(bookingId);

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'PAYMENT_RECEIVED',
      targetModel: 'Payment',
      targetId: payment._id,
      description: `Payment received — Rs. ${booking.totalAmount} via ${paymentMethod}`,
      metadata: {
        amount: booking.totalAmount,
        paymentMethod,
        transactionId: payment.transactionId,
        bookingId,
        guestName: booking.guestName,
      },
    });

    res.status(201).json({ message: 'Payment successful', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// GET INVOICE
// ========================
const getInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'roomId', select: 'roomNumber type price' },
        ],
      });

    if (!payment) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// GET ALL PAYMENTS
// ========================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'roomId', select: 'roomNumber type price' },
        ],
      })
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createPayment, getInvoice, getAllPayments };
