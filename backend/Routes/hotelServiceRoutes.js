const express = require('express');
const router  = express.Router();
const {
  getAllServices, getActiveServices, createService, updateService, deleteService
} = require('../Controllers/hotelServiceController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');
const upload = require('../Middleware/uploadMiddleware');

// Public — user website ke liye
router.get('/active', getActiveServices);

// Admin routes
router.get('/',       protect, staffRoles('admin', 'manager'), getAllServices);
router.post('/',      protect, staffRoles('admin', 'manager'), upload.single('image'), createService);
router.put('/:id',    protect, staffRoles('admin', 'manager'), upload.single('image'), updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;