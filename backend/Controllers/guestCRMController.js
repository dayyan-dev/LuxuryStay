const GuestProfile = require('../Models/GuestProfile');
const User = require('../Models/User');
const Booking = require('../Models/Booking');
const auditLog = require('../Services/auditLogService');

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Match bookings by account id OR guest contact (admin/walk-in bookings). */
const bookingsForGuest = (user) => {
  const clauses = [{ userId: user._id }];
  if (user.email) {
    clauses.push({ guestEmail: new RegExp(`^${escapeRegex(user.email)}$`, 'i') });
  }
  if (user.phone) {
    clauses.push({ guestPhone: user.phone });
  }
  return Booking.find({ $or: clauses })
    .populate('roomId', 'roomNumber type price images')
    .sort({ createdAt: -1 });
};

/** Real stays only — not pending/confirmed reservations. */
const countStays = (bookings) =>
  bookings.filter((b) =>
    ['completed', 'checked_out', 'checked_in'].includes(b.bookingStatus)
  ).length;

// ── GET all guests with CRM data ──
const getAllGuestProfiles = async (req, res) => {
  try {
    const users = await User.find({ role: 'guest' }).select('-password');

    const profiles = await Promise.all(users.map(async (user) => {
      let profile = await GuestProfile.findOne({ userId: user._id });

      // Auto create profile if not exists
      if (!profile) {
        profile = await GuestProfile.create({ userId: user._id });
      }

      const bookings = await bookingsForGuest(user);

      const totalSpent = bookings
        .filter(b => b.paymentStatus === 'paid' && b.bookingStatus !== 'cancelled')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const completedStays = countStays(bookings);

      // Auto VIP — 5+ stays ya 100k+ spend
      if (completedStays >= 5 || totalSpent >= 100000) {
        await GuestProfile.findByIdAndUpdate(profile._id, {
          isVIP: true,
          totalStays: completedStays,
          totalSpent,
          vipReason: completedStays >= 5 ? 'Frequent Guest (5+ stays)' : 'High Value Guest (100k+ spent)',
        });
        profile.isVIP = true;
      } else {
        await GuestProfile.findByIdAndUpdate(profile._id, {
          totalStays: completedStays,
          totalSpent,
        });
      }

      return {
        user,
        profile,
        bookings,
        totalSpent,
        completedStays,
        lastStay: bookings[0] || null,
      };
    }));

    res.status(200).json({ success: true, guests: profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET single guest full profile ──
const getGuestProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Guest not found' });

    let profile = await GuestProfile.findOne({ userId: user._id });
    if (!profile) profile = await GuestProfile.create({ userId: user._id });

    const bookings = await bookingsForGuest(user);
    const completedStays = countStays(bookings);
    const totalSpent = bookings
      .filter((b) => b.paymentStatus === 'paid' && b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      user,
      profile,
      bookings,
      completedStays,
      totalSpent,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE guest preferences ──
const updateGuestProfile = async (req, res) => {
  try {
    const { preferences, birthday, anniversary, isVIP, vipReason, tags, notes } = req.body;

    let profile = await GuestProfile.findOne({ userId: req.params.userId });
    if (!profile) profile = await GuestProfile.create({ userId: req.params.userId });

    const updates = {};
    if (preferences) updates.preferences = { ...profile.preferences, ...preferences };
    if (birthday !== undefined) updates.birthday = birthday;
    if (anniversary !== undefined) updates.anniversary = anniversary;
    if (isVIP !== undefined) updates.isVIP = isVIP;
    if (vipReason) updates.vipReason = vipReason;
    if (tags) updates.tags = tags;

    const updated = await GuestProfile.findByIdAndUpdate(profile._id, updates, { new: true });

    await auditLog.log(req, {
      action: 'USER_UPDATED',
      targetModel: 'User',
      targetId: req.params.userId,
      description: `Guest CRM profile updated`,
      metadata: updates,
    });

    res.status(200).json({ success: true, profile: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET CRM summary stats ──
const getCRMStats = async (req, res) => {
  try {
    const totalGuests = await User.countDocuments({ role: 'guest' });
    const vipGuests = await GuestProfile.countDocuments({ isVIP: true });
    const profiles = await GuestProfile.find();
    const totalRevenue = profiles.reduce((sum, p) => sum + p.totalSpent, 0);
    const avgSpend = totalGuests > 0 ? Math.round(totalRevenue / totalGuests) : 0;

    res.status(200).json({
      success: true,
      stats: { totalGuests, vipGuests, totalRevenue, avgSpend },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// redeem points
const redeemPoints = async (req, res) => {
  try {
    const { points } = req.body;
    if (!points || points <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid points' });
    }

    const profile = await GuestProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    if (profile.loyaltyPoints < points) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }

    const discountAmount = points * 10; // 1 point = PKR 10 discount

    await GuestProfile.findByIdAndUpdate(profile._id, {
      $inc: { loyaltyPoints: -points }
    });

    res.status(200).json({
      success: true,
      message: `${points} points redeemed`,
      discountAmount,
      remainingPoints: profile.loyaltyPoints - points,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get loyalty info
const getLoyaltyInfo = async (req, res) => {
  try {
    const profile = await GuestProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const tier =
      profile.loyaltyPoints >= 1000 ? { name: 'Platinum', color: 'info',    icon: '💎' } :
      profile.loyaltyPoints >= 500  ? { name: 'Gold',     color: 'warning', icon: '🥇' } :
      profile.loyaltyPoints >= 100  ? { name: 'Silver',   color: 'secondary',icon: '🥈' } :
                                      { name: 'Bronze',   color: 'danger',  icon: '🥉' };

    res.status(200).json({
      success: true,
      points: profile.loyaltyPoints,
      tier,
      discountValue: profile.loyaltyPoints * 10,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = {
  getAllGuestProfiles, getGuestProfile,
  updateGuestProfile, getCRMStats,
  redeemPoints, getLoyaltyInfo,
};