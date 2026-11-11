const express = require('express');
const router = express.Router();
const { getSettings, saveSettings, saveBulkSettings } = require('../Controllers/settingsController');
const { protect, adminOnly } = require('../Middleware/authMiddleware');

router.get('/', protect, adminOnly, getSettings);
router.post('/', protect, adminOnly, saveSettings);
router.put('/bulk', protect, adminOnly, saveBulkSettings);

module.exports = router;
