const Booking = require("../Models/Booking");
const Room = require("../Models/Room");
const User = require('../Models/User');
const Offer = require('../Models/Offer');
const sendEmail = require('../Services/emailService');
const auditLog = require('../Services/auditLogService'); // ✅ ADD
const {
  bookingConfirmationTemplate,
  cancellationTemplate,
} = require('../Utils/emailTemplates');
const { calculatePrice } = require('../Services/pricingService');
const GuestProfile = require('../Models/GuestProfile');
const { awardLoyaltyPoints, reverseLoyaltyPoints } = require('../Services/loyaltyService');
const QRCode = require('qrcode');
const { buildInvoicePdf } = require('../Services/invoiceService');
const Settings = require('../Models/Settings');

// ========================
// Helper: Unique Booking Reference Generator (e.g. LS-2610-A4B7)
// ========================
const generateBookingReference = () => {
  const yearMonth = new Date().toISOString().slice(2, 7).replace('-', '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LS-${yearMonth}-${randomChars}`;
};

// ========================
// Helper: check karo ke ek room in exact dates ke liye
// pehle se kisi confirmed/pending booking se conflict to nahi karta
// (room.status ek single flag hai jo "aaj" ka haal batata hai,
// isliye future date-range booking ke liye asal Bookings collection
// check karna zaroori hai)
// ========================
const isRoomAvailableForDates = async (roomId, checkInDate, checkOutDate, excludeBookingId = null) => {
  const query = {
    roomId,
    bookingStatus: { $in: ["pending", "confirmed", "checked_in"] },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(query);
  return !conflict;
};

// ========================
// CREATE BOOKING (Server-side validated & price recalculated)
// ========================
const createBooking = async (req, res) => {
  try {
    const {
      roomId, guestName, guestPhone, guestEmail,
      checkInDate, checkOutDate, guests, specialRequests,
      paymentMethod, promoCode, appliedPromo,
    } = req.body;

    // 1. Validate required fields
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required." });
    }
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Both check-in and check-out dates are required." });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: "Invalid check-in or check-out date format." });
    }

    // Check-in cannot be in the past (compare by calendar day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDay = new Date(checkIn);
    checkInDay.setHours(0, 0, 0, 0);

    if (checkInDay < today) {
      return res.status(400).json({ message: "Check-in date cannot be in the past." });
    }

    // Check-out must be after check-in (at least 1 night)
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);
    if (nights <= 0) {
      return res.status(400).json({ message: "Check-out date must be at least 1 night after check-in date." });
    }

    // 2. Validate Room
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (["maintenance", "inactive"].includes(room.status)) {
      return res.status(400).json({ message: "Selected room is currently unavailable (under maintenance)." });
    }

    // Validate Guest Capacity
    const guestCount = Math.max(1, Number(guests) || 1);
    const maxCapacity = room.capacity || 4;
    if (guestCount > maxCapacity) {
      return res.status(400).json({
        message: `Guest count exceeds capacity. ${room.type || 'This'} room accommodates maximum ${maxCapacity} guest(s).`,
      });
    }

    // 3. Real Date Overlap Check
    const available = await isRoomAvailableForDates(roomId, checkIn, checkOut);
    if (!available) {
      return res.status(400).json({ message: "Room is already booked for the selected dates." });
    }

    // 4. Server-Side Trusted Price Recalculation (Never trust client totalAmount)
    const basePricePerNight = Number(room.price) || 0;
    let pricePerNight = basePricePerNight;
    try {
      const pricing = await calculatePrice(basePricePerNight, room.type, checkIn);
      if (pricing?.finalPrice) {
        pricePerNight = pricing.finalPrice;
      }
    } catch (pricingErr) {
      console.warn("Pricing calculation notice:", pricingErr.message);
    }

    const trustedSubtotal = nights * pricePerNight;

    // Validate Promo Code server-side
    let trustedDiscount = 0;
    let verifiedPromoCode = null;
    const rawCode = (promoCode || appliedPromo?.code || '').trim().toUpperCase();

    if (rawCode) {
      const now = new Date();
      const offer = await Offer.findOne({
        code: rawCode,
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      });

      if (offer && nights >= (offer.minNights || 1)) {
        const hotelMatches = !offer.applicableHotels?.length ||
          (room.hotelId && offer.applicableHotels.some(h => h.toString() === room.hotelId.toString()));
        if (hotelMatches) {
          verifiedPromoCode = offer.code;
          if (offer.discountType === 'percentage') {
            trustedDiscount = Math.round((trustedSubtotal * offer.discountValue) / 100);
          } else {
            trustedDiscount = Math.min(trustedSubtotal, offer.discountValue);
          }
        }
      }
    }

    let finalTrustedAmount = Math.max(0, trustedSubtotal - trustedDiscount);

    // 5. Payment & Booking Workflow
    const chosenMethod = paymentMethod === "online" ? "online" : "cash";
    // For cash/pay-at-hotel: reservation is confirmed, payment is pending arrival
    let finalPaymentStatus = "pending";
    let finalBookingStatus = "confirmed";

    // Generate unique booking reference
    let bookingReference = generateBookingReference();
    while (await Booking.findOne({ bookingReference })) {
      bookingReference = generateBookingReference();
    }

    // Room status update if checking in today
    const isCheckInToday = checkInDay.getTime() === today.getTime();
    let finalRoomStatus = room.status;
    if (isCheckInToday) {
      finalRoomStatus = "reserved";
    }

    // 6. Create Booking in MongoDB
    const booking = await Booking.create({
      bookingReference,
      userId: req.body.userId || req.user?._id,
      roomId,
      guestName: guestName || "Valued Guest",
      guestPhone: guestPhone || "",
      guestEmail: guestEmail || "",
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: guestCount,
      totalAmount: finalTrustedAmount,
      discountAmount: trustedDiscount,
      promoCode: verifiedPromoCode,
      specialRequests: specialRequests || "",
      bookingStatus: finalBookingStatus,
      paymentMethod: chosenMethod,
      paymentStatus: finalPaymentStatus,
    });

    if (booking.userId) {
      await User.findByIdAndUpdate(booking.userId, { $push: { bookings: booking._id } });
    }
    if (finalRoomStatus !== room.status) {
      await Room.findByIdAndUpdate(roomId, { status: finalRoomStatus });
    }

    // 7. Audit Log
    await auditLog.log(req, {
      action: 'BOOKING_CREATED',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `New booking created — Ref ${bookingReference} (Room ${room.roomNumber}) for ${guestName || 'Guest'}`,
      metadata: {
        bookingReference,
        roomNumber: room.roomNumber,
        guestName,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        subtotal: trustedSubtotal,
        discountAmount: trustedDiscount,
        totalAmount: finalTrustedAmount,
        paymentMethod: chosenMethod,
      },
    });

    // 8. Loyalty points redemption (if requested)
    if (booking.userId && req.body.redeemPoints > 0) {
      const profile = await GuestProfile.findOne({ userId: booking.userId });
      if (profile && profile.loyaltyPoints >= req.body.redeemPoints) {
        const pointsDiscount = req.body.redeemPoints * 10;
        await GuestProfile.findByIdAndUpdate(profile._id, {
          $inc: { loyaltyPoints: -req.body.redeemPoints }
        });
        finalTrustedAmount = Math.max(0, finalTrustedAmount - pointsDiscount);
        await Booking.findByIdAndUpdate(booking._id, {
          totalAmount: finalTrustedAmount,
          discountAmount: trustedDiscount + pointsDiscount,
          redeemedPoints: req.body.redeemPoints,
        });
        booking.totalAmount = finalTrustedAmount;
        booking.discountAmount = trustedDiscount + pointsDiscount;
      }
    }

    // Real-time socket notification
    const io = req.app.get('io');
    if (io) {
      io.to('hotel_room').emit('new_notification', {
        type: 'booking',
        title: '📋 New Booking',
        message: `Room ${room.roomNumber} reserved by ${guestName || 'Guest'} (${nights} night${nights !== 1 ? 's' : ''})`,
        severity: 'success',
        timestamp: new Date(),
      });
    }

    // Send emails safely
    try {
      await sendEmail({
        to: booking.guestEmail,
        subject: `LuxuryStay Reservation Confirmation — ${bookingReference}`,
        html: bookingConfirmationTemplate({
          name: booking.guestName,
          roomNo: room.roomNumber,
          checkInDate: checkIn.toLocaleDateString('en-GB'),
          checkOutDate: checkOut.toLocaleDateString('en-GB'),
          totalPrice: finalTrustedAmount.toLocaleString(),
          paymentMethod: chosenMethod === 'cash' ? 'Pay at Hotel (Cash / Card)' : 'Online Payment',
          paymentStatus: finalPaymentStatus,
          bookingStatus: finalBookingStatus,
        }),
      });
    } catch (emailErr) {
      console.warn("Guest confirmation email skipped:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Reservation confirmed successfully!",
      booking,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error creating reservation", error: err.message });
  }
};

// ========================
// MY BOOKINGS
// ========================
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("roomId", "name roomNumber type price status images")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========================
// GET BOOKINGS BY USER ID
// ========================
const getBookingsByUserId = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id })
      .populate("roomId", "name roomNumber type price status images")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========================
// ALL BOOKINGS (Admin)
// ========================
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email phone")
      .populate("roomId", "name roomNumber type price status")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========================
// UPDATE BOOKING STATUS
// ========================
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const previousStatus = booking.bookingStatus;

    if (bookingStatus === "cancelled" && booking.bookingStatus !== "cancelled") {
      await Room.findByIdAndUpdate(booking.roomId, { status: "available" });
      const room = await Room.findById(booking.roomId);
      await sendEmail({
        to: booking.guestEmail,
        subject: 'Booking Cancelled',
        html: cancellationTemplate({
          name: booking.guestName, roomNo: room?.roomNumber,
          checkInDate: booking.checkInDate, checkOutDate: booking.checkOutDate,
        }),
      });
    }

    if (bookingStatus === "completed" && booking.bookingStatus !== "completed") {
      await Room.findByIdAndUpdate(booking.roomId, { status: "available" });
    }

    // Pending se confirmed hone par confirmation email bhejo
    // (jaise reception par cash payment collect hone ke baad admin status update kare)
    if (bookingStatus === "confirmed" && booking.bookingStatus !== "confirmed") {
      const room = await Room.findById(booking.roomId);
      await sendEmail({
        to: booking.guestEmail,
        subject: 'Booking Confirmed',
        html: bookingConfirmationTemplate({
          name: booking.guestName, roomNo: room?.roomNumber,
          checkInDate: booking.checkInDate, checkOutDate: booking.checkOutDate,
          totalPrice: booking.totalAmount, paymentMethod: booking.paymentMethod,
          paymentStatus: paymentStatus || booking.paymentStatus, bookingStatus: 'confirmed',
        }),
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...(bookingStatus && { bookingStatus }), ...(paymentStatus && { paymentStatus }) },
      { new: true }
    );

    // Loyalty points: payment "paid" hote hi award karo
    if (paymentStatus === "paid") {
      await awardLoyaltyPoints(booking._id);
    }
    // Loyalty points: booking cancel hone par (agar award ho chuke thay) wapis le lo
    if (bookingStatus === "cancelled" && booking.bookingStatus !== "cancelled") {
      await reverseLoyaltyPoints(booking._id);
    }

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: bookingStatus === 'cancelled' ? 'BOOKING_CANCELLED' : 'BOOKING_UPDATED',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `Booking status changed: ${previousStatus} → ${bookingStatus || previousStatus}`,
      metadata: { previousStatus, newStatus: bookingStatus, paymentStatus },
      severity: bookingStatus === 'cancelled' ? 'warning' : 'info',
    });

    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========================
// CHECK-IN
// ========================
const checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomId', 'roomNumber');
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (!["confirmed", "pending"].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, message: "Only confirmed or pending bookings can be checked in" });
    }

    booking.bookingStatus = "checked_in";
    await booking.save();
    await Room.findByIdAndUpdate(booking.roomId, { status: "occupied" });

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'BOOKING_CHECKED_IN',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `Guest ${booking.guestName} checked in — Room ${booking.roomId?.roomNumber}`,
      metadata: { guestName: booking.guestName, roomId: booking.roomId },
    });

    const io = req.app.get('io');
    if (io) {
      io.to('hotel_room').emit('room_status_updated', {
        roomId: booking.roomId?._id || booking.roomId,
        status: 'occupied',
      });
    }
    try {
      const { reconcileRoomStatuses } = require('../Services/roomStatusService');
      await reconcileRoomStatuses(io);
    } catch (_) { /* non-blocking */ }
    res.status(200).json({ success: true, message: "Guest checked in successfully", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// CHECK-OUT
// ========================
const checkOutBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomId', 'roomNumber');
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.bookingStatus !== "checked_in") {
      return res.status(400).json({ success: false, message: "Only checked-in guests can checkout" });
    }
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Payment is pending. Please collect payment before checkout." });
    }

    booking.bookingStatus = "checked_out";
    await booking.save();
    await Room.findByIdAndUpdate(booking.roomId, { status: "cleaning" });

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'BOOKING_CHECKED_OUT',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `Guest ${booking.guestName} checked out — Room sent to cleaning`,
      metadata: { guestName: booking.guestName, roomId: booking.roomId },
    });

    const io = req.app.get('io');
    if (io) {
      io.to('hotel_room').emit('room_status_updated', {
        roomId: booking.roomId?._id || booking.roomId,
        status: 'cleaning',
      });
    }
    res.status(200).json({ success: true, message: "Guest checked out successfully", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// COMPLETE BOOKING
// ========================
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.bookingStatus !== "checked_out") {
      return res.status(400).json({ success: false, message: "Booking must be checked out first" });
    }

    booking.bookingStatus = "completed";
    await booking.save();
    await Room.findByIdAndUpdate(booking.roomId, { status: "available" });

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'BOOKING_UPDATED',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `Booking completed — Room marked available`,
    });

    try {
      const { reconcileRoomStatuses } = require('../Services/roomStatusService');
      await reconcileRoomStatuses(req.app.get('io'));
    } catch (_) { /* non-blocking */ }

    res.status(200).json({ success: true, message: "Booking completed successfully", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// UPDATE PAYMENT STATUS
// ========================
const updatePaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.paymentStatus = "paid";
    if (booking.bookingStatus === "pending") booking.bookingStatus = "confirmed";
    await booking.save();
    await Room.findByIdAndUpdate(booking.roomId, { status: "occupied" });

    // Loyalty points award karo
    await awardLoyaltyPoints(booking._id);

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'PAYMENT_RECEIVED',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `Payment marked as paid for booking — Rs. ${booking.totalAmount}`,
      metadata: { amount: booking.totalAmount, guestName: booking.guestName },
    });

    res.status(200).json({ success: true, message: "Payment marked as paid", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Generate QR Code for booking
const generateBookingQR = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('roomId', 'roomNumber type')
      .populate('userId', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // QR data
    const qrData = JSON.stringify({
      bookingId: booking._id,
      guestName: booking.guestName || booking.userId?.name,
      roomNumber: booking.roomId?.roomNumber,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      action: 'CHECK_IN',
    });

    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({ success: true, qrCode, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// QR self check-in
const qrCheckIn = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (!['confirmed', 'pending'].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.bookingStatus}` });
    }

    // Check-in date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate > today) {
      return res.status(400).json({
        success: false,
        message: `Check-in date is ${new Date(booking.checkInDate).toLocaleDateString('en-PK')}. You cannot check in early.`
      });
    }

    booking.bookingStatus = 'checked_in';
    await booking.save();
    await Room.findByIdAndUpdate(booking.roomId, { status: 'occupied' });

    // Audit log
    await auditLog.log(req, {
      action: 'BOOKING_CHECKED_IN',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `Self check-in via QR code — Booking ${booking._id}`,
    });

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to('hotel_room').emit('room_status_updated', {
        roomId: booking.roomId,
        status: 'occupied',
      });
      io.to('hotel_room').emit('new_notification', {
        type: 'booking',
        title: '📱 QR Self Check-in',
        message: `${booking.guestName} checked in via QR — Room ${booking.roomId?.roomNumber || ''}`,
        severity: 'success',
        timestamp: new Date(),
      });
    }

    res.status(200).json({ success: true, message: 'Check-in successful! Welcome to the hotel.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========================
// Shared helper: authorize invoice access + load booking.
// Guests may only access their OWN invoices; staff roles may access any.
// ========================
const loadAuthorizedBooking = async (req, bookingId) => {
  const booking = await Booking.findById(bookingId).populate('roomId', 'roomNumber type price');
  if (!booking) return { error: 404, message: 'Booking not found' };

  const staffRolesAllowed = ['admin', 'manager', 'receptionist'];
  const isOwner = booking.userId && booking.userId.toString() === req.user._id.toString();
  const isStaff = staffRolesAllowed.includes(req.user.role);

  if (!isOwner && !isStaff) {
    return { error: 403, message: 'Access denied. This is not your booking.' };
  }
  if (booking.paymentStatus !== 'paid') {
    return { error: 400, message: 'Invoice sirf paid bookings ke liye available hai.' };
  }
  return { booking };
};

// Read configured tax % (Settings key: taxPercent) for invoice breakdown
const getTaxPercent = async () => {
  try {
    const doc = await Settings.findOne({ key: 'taxPercent' });
    const val = parseFloat(doc?.value);
    return Number.isFinite(val) ? val : 0;
  } catch {
    return 0;
  }
};

// ========================
// DOWNLOAD INVOICE (PDF) — Guest apni khud ki booking ka invoice
// ========================
const downloadInvoice = async (req, res) => {
  try {
    const { booking, error, message } = await loadAuthorizedBooking(req, req.params.id);
    if (error) return res.status(error).json({ message });

    const taxPercent = await getTaxPercent();
    const pdfBuffer = await buildInvoicePdf(booking, { taxPercent });
    const invoiceNumber = `INV-${booking._id.toString().slice(-8).toUpperCase()}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// EMAIL INVOICE (PDF attachment) — to the guest on the booking
// Authorization: same rules as download. Duplicate-send prevention:
// staff can force-resend; a guest cannot send twice.
// ========================
const emailInvoice = async (req, res) => {
  try {
    const { booking, error, message } = await loadAuthorizedBooking(req, req.params.id);
    if (error) return res.status(error).json({ message });

    if (!booking.guestEmail) {
      return res.status(400).json({ message: 'No email address on this booking.' });
    }

    // Duplicate-send guard: non-staff (guest) may email an invoice only once
    const staffRolesAllowed = ['admin', 'manager', 'receptionist'];
    const isStaff = staffRolesAllowed.includes(req.user.role);
    if (!isStaff && booking.invoiceEmailed) {
      return res.status(400).json({ message: 'Invoice has already been emailed to you. Contact reception to resend.' });
    }

    const taxPercent = await getTaxPercent();
    const pdfBuffer = await buildInvoicePdf(booking, { taxPercent });
    const invoiceNumber = `INV-${booking._id.toString().slice(-8).toUpperCase()}`;

    const sent = await sendEmail({
      to: booking.guestEmail,
      subject: `Your Invoice ${invoiceNumber} — Hotel Management System`,
      html: `<h2>Your Invoice</h2>
        <p>Dear ${booking.guestName || 'Guest'},</p>
        <p>Thank you for staying with us. Your invoice <strong>${invoiceNumber}</strong>
        (Rs. ${booking.totalAmount}) is attached as a PDF.</p>
        <p>We look forward to welcoming you again.</p>`,
      attachments: [{
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });

    if (!sent) {
      return res.status(502).json({ success: false, message: 'Email service is unavailable. Please try again later or download the invoice from the website.' });
    }

    await Booking.findByIdAndUpdate(booking._id, { invoiceEmailed: true, invoiceEmailedAt: new Date() });

    await auditLog.log(req, {
      action: 'INVOICE_EMAILED',
      targetModel: 'Booking',
      targetId: booking._id,
      description: `Invoice ${invoiceNumber} emailed to ${booking.guestEmail}`,
    });

    res.status(200).json({ success: true, message: `Invoice emailed to ${booking.guestEmail}.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// GET ROOM'S BOOKED DATES (for calendar) — public, no auth needed
// Guest ko room booking page par yahi dikhega ke kaunse dates available nahi
// ========================
const getRoomBookedDates = async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await Booking.find({
      roomId: id,
      bookingStatus: { $in: ["pending", "confirmed", "checked_in"] },
      checkOutDate: { $gte: new Date() }, // guzri hui bookings zaroori nahi
    }).select("checkInDate checkOutDate -_id");

    const bookedRanges = bookings.map((b) => ({
      checkIn: b.checkInDate,
      checkOut: b.checkOutDate,
    }));

    res.status(200).json({ bookedRanges });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createBooking, getMyBookings, getBookingsByUserId,
  getAllBookings, updateBookingStatus, checkInBooking,
  checkOutBooking, completeBooking, updatePaymentStatus,
  generateBookingQR, qrCheckIn, downloadInvoice, emailInvoice,
  getRoomBookedDates,
};
