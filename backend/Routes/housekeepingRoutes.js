const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, updateTaskStatus, deleteTask } = require('../Controllers/housekeepingController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/my', protect, async (req, res) => {
  const Housekeeping = require('../Models/Housekeeping');
  const data = await Housekeeping.find({ requestedBy: req.user.id }).sort({ createdAt: -1 });
  res.json(data);
});
router.get('/', protect, staffRoles('admin', 'manager', 'housekeeping'), getAllTasks);
router.put('/:id', protect, updateTaskStatus);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;