const express = require('express');
const router = express.Router();
const { createPayment, getInvoice, getAllPayments } = require('../Controllers/paymentController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');

router.post('/', protect, createPayment);
router.get('/', protect, staffRoles('admin', 'manager'), getAllPayments);
router.get('/invoice/:id', protect, staffRoles('admin', 'manager'), getInvoice);

module.exports = router;