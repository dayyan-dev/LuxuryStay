const PricingRule = require('../Models/PricingRule');
const { calculatePrice } = require('../Services/pricingService');
const auditLog = require('../Services/auditLogService');

// GET all rules
const getAllRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE rule
const createRule = async (req, res) => {
  try {
    const rule = await PricingRule.create(req.body);
    await auditLog.log(req, {
      action: 'SETTINGS_UPDATED',
      description: `Pricing rule created: ${rule.name}`,
      metadata: { rule },
    });
    res.status(201).json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE rule
const updateRule = async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.status(200).json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE rule
const deleteRule = async (req, res) => {
  try {
    await PricingRule.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Rule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CALCULATE price for a room on a date
const getCalculatedPrice = async (req, res) => {
  try {
    const { basePrice, roomType, checkIn } = req.query;
    if (!basePrice || !checkIn) {
      return res.status(400).json({ success: false, message: 'basePrice and checkIn required' });
    }
    const result = await calculatePrice(Number(basePrice), roomType, checkIn);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllRules, createRule, updateRule, deleteRule, getCalculatedPrice };