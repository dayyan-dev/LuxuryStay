const express = require('express');
const router = express.Router();
const offerController = require('../Controllers/offerController');
const { protect, managerOrAdmin } = require('../Middleware/authMiddleware');

// Public routes
router.get('/', offerController.getAllOffers);
router.get('/:id', offerController.getOfferById);
router.post('/validate', offerController.validatePromoCode);

// Protected routes (Admin / Manager)
router.post('/', protect, managerOrAdmin, offerController.createOffer);

module.exports = router;

