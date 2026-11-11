const express = require('express');
const router = express.Router();
const {
  addMenuItem,
  getMenu,
  getMenuByCategory,
  updateMenuItem,
  deleteMenuItem
} = require('../Controllers/restaurantMenuController');
const { protect, adminOnly, staffRoles } = require('../Middleware/authMiddleware');
const upload = require('../Middleware/uploadMiddleware');

router.get('/', getMenu);
router.get('/category/:category', getMenuByCategory);

// multer middleware add kiya — image upload ke liye
router.post('/', protect, staffRoles('admin', 'manager'), upload.single('image'), addMenuItem);
router.put('/:id', protect, staffRoles('admin', 'manager'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;