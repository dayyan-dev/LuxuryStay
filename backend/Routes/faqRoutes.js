const express = require('express');
const router = express.Router();
const {
  getAllFAQs, getActiveFAQs, createFAQ, updateFAQ, deleteFAQ
} = require('../Controllers/faqController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');

// Public route — user website ke liye
router.get('/active', getActiveFAQs);

// Admin routes
router.get('/',      protect, staffRoles('admin', 'manager'), getAllFAQs);
router.post('/',     protect, staffRoles('admin', 'manager'), createFAQ);
router.put('/:id',   protect, staffRoles('admin', 'manager'), updateFAQ);
router.delete('/:id',protect, adminOnly, deleteFAQ);

module.exports = router;