const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getOrdersByUserId,
  
} = require('../Controllers/restaurantOrderController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, staffRoles('admin', 'manager', 'receptionist', 'kitchen'), getOrders);
router.put('/:id', protect, staffRoles('admin', 'manager', 'receptionist', 'kitchen'), updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);
router.get('/user/:userId', protect, getOrdersByUserId);

module.exports = router;
