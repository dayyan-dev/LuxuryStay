const Offer = require('../Models/Offer');
const auditLog = require('../Services/auditLogService');

// ============================================================
// GET ALL ACTIVE OFFERS
// ============================================================
const getAllOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      validUntil: { $gte: now },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch offers', error: err.message });
  }
};

// ============================================================
// GET OFFER BY ID
// ============================================================
const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch offer', error: err.message });
  }
};

// ============================================================
// VALIDATE PROMO CODE (Server-side validation)
// ============================================================
const validatePromoCode = async (req, res) => {
  try {
    const { code, totalAmount, nights = 1, hotelId } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date();

    const offer = await Offer.findOne({
      code: cleanCode,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code.',
      });
    }

    if (nights < (offer.minNights || 1)) {
      return res.status(400).json({
        success: false,
        message: `This promo requires a minimum stay of ${offer.minNights} night(s).`,
      });
    }

    // Check hotel restriction if applicable
    if (offer.applicableHotels && offer.applicableHotels.length > 0 && hotelId) {
      const isApplicable = offer.applicableHotels.some(h => h.toString() === hotelId.toString());
      if (!isApplicable) {
        return res.status(400).json({
          success: false,
          message: 'This promo code is not applicable for the selected hotel property.',
        });
      }
    }

    const baseAmount = Number(totalAmount) || 0;
    let discount = 0;

    if (offer.discountType === 'percentage') {
      discount = Math.round((baseAmount * offer.discountValue) / 100);
    } else {
      discount = Math.min(baseAmount, offer.discountValue);
    }

    res.json({
      success: true,
      message: `Promo code '${cleanCode}' applied successfully!`,
      data: {
        code: offer.code,
        title: offer.title,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        discountAmount: discount,
        finalAmount: Math.max(0, baseAmount - discount),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to validate promo code', error: err.message });
  }
};

// ============================================================
// CREATE OFFER (Admin only)
// ============================================================
const createOffer = async (req, res) => {
  try {
    const newOffer = await Offer.create(req.body);

    await auditLog.log(req, {
      action: 'OFFER_CREATED',
      targetModel: 'Offer',
      targetId: newOffer._id,
      description: `Created offer ${newOffer.title} [${newOffer.code}]`,
    });

    res.status(201).json({ success: true, message: 'Offer created successfully', data: newOffer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create offer', error: err.message });
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  validatePromoCode,
  createOffer,
};

