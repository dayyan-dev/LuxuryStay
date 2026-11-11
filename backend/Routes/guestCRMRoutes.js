const express = require('express');
const router = express.Router();
const { protect, managerOrAdmin, ownerOrStaff } = require('../Middleware/authMiddleware');
const {
  getAllGuestProfiles, getGuestProfile,
  updateGuestProfile, getCRMStats,
  redeemPoints, getLoyaltyInfo,
} = require('../Controllers/guestCRMController');

router.get('/',                    protect, managerOrAdmin, getAllGuestProfiles);
router.get('/stats',               protect, managerOrAdmin, getCRMStats);
router.get('/:userId',             protect, ownerOrStaff, getGuestProfile);
router.put('/:userId',             protect, ownerOrStaff, updateGuestProfile);
router.get('/:userId/loyalty',    protect, ownerOrStaff, getLoyaltyInfo);
router.post('/:userId/redeem',    protect, managerOrAdmin, redeemPoints);

module.exports = router;