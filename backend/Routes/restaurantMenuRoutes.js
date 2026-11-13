const express = require('express');
const router = express.Router();
const {
  addMenuItem,
  getMenu,
  getMenuByCategory,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../Controllers/restaurantMenuController');
const { protect, staffRoles } = require('../Middleware/authMiddleware');
const upload = require('../Middleware/uploadMiddleware');

// ── CATEGORIES ──
router.get('/categories', getCategories);
router.post('/categories', protect, staffRoles('admin', 'manager'), createCategory);
router.put('/categories/:id', protect, staffRoles('admin', 'manager'), updateCategory);
router.delete('/categories/:id', protect, staffRoles('admin', 'manager'), deleteCategory);

// ── MENU ITEMS ──
router.get('/', getMenu);
router.get('/category/:category', getMenuByCategory);

// Multer middleware for image upload
router.post('/', protect, staffRoles('admin', 'manager'), upload.single('image'), addMenuItem);
router.put('/:id', protect, staffRoles('admin', 'manager'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, staffRoles('admin', 'manager'), deleteMenuItem);

module.exports = router;
