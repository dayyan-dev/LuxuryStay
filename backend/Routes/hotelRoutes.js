const express = require('express');
const router = express.Router();
const hotelController = require('../Controllers/hotelController');
const { protect, managerOrAdmin } = require('../Middleware/authMiddleware');

// Public routes
router.get('/', hotelController.getAllHotels);
router.get('/featured', hotelController.getFeaturedHotels);
router.get('/cities', hotelController.getCities);
router.get('/:id', hotelController.getHotelById);

// Protected routes (Admin / Manager)
router.post('/', protect, managerOrAdmin, hotelController.createHotel);
router.put('/:id', protect, managerOrAdmin, hotelController.updateHotel);

module.exports = router;

