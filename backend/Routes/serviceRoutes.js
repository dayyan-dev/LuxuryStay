const express = require('express');
const router = express.Router();
const { createService, getAllServices, updateServiceStatus } = require('../Controllers/serviceController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');

router.post('/', protect, createService);
router.get('/my', protect, async (req, res) => {
  const Service = require('../Models/Service');
  const data = await Service.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(data);
});
router.get('/', protect, staffRoles('admin', 'manager', 'receptionist'), getAllServices);
router.put('/:id', protect, staffRoles('admin', 'manager', 'receptionist'), updateServiceStatus);
module.exports = router;