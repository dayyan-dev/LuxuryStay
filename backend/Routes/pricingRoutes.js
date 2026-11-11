const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../Middleware/authMiddleware');
const {
  getAllRules, createRule, updateRule, deleteRule, getCalculatedPrice
} = require('../Controllers/pricingController');

router.get('/',           protect, adminOnly, getAllRules);
router.post('/',          protect, adminOnly, createRule);
router.put('/:id',        protect, adminOnly, updateRule);
router.delete('/:id',     protect, adminOnly, deleteRule);
router.get('/calculate',  protect, getCalculatedPrice);

module.exports = router;