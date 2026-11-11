const express = require('express');
const router  = express.Router();
const { getAboutUs, updateAboutUs } = require('../Controllers/aboutUsController');
const { protect, staffRoles } = require('../Middleware/authMiddleware');

router.get('/', getAboutUs);
router.put('/', protect, staffRoles('admin', 'manager'), updateAboutUs);

module.exports = router;