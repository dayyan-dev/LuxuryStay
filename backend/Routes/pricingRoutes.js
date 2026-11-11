const express = require('express');
const router = express.Router();
const { protect, managerOrAdmin } = require('../Middleware/authMiddleware');
const {
  getAllRules, createRule, updateRule, deleteRule, getCalculatedPrice
} = require('../Controllers/pricingController');

router.get('/',           protect, managerOrAdmin, getAllRules);
router.post('/',          protect, managerOrAdmin, createRule);
router.put('/:id',        protect, managerOrAdmin, updateRule);
router.delete('/:id',     protect, managerOrAdmin, deleteRule);
router.get('/calculate',  protect, getCalculatedPrice);

module.exports = router;