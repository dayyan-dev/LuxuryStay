 const express = require('express');
const router = express.Router();
const { createMaintenance, getAllMaintenance, updateMaintenanceStatus } = require('../Controllers/maintenanceController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');

router.post('/', protect, createMaintenance);
router.get('/my', protect, async (req, res) => {
  const Maintenance = require('../Models/Maintenance');
  const data = await Maintenance.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
  res.json(data);
});
router.get('/', protect, staffRoles('admin', 'manager', 'maintenance'), getAllMaintenance);
router.put('/:id', protect, staffRoles('admin', 'manager', 'maintenance'), updateMaintenanceStatus);

module.exports = router;