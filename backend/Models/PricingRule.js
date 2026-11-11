const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['weekend', 'seasonal', 'special_event'],
    required: true,
  },
  adjustment: { type: Number, required: true }, // percentage — 20 matlab 20% zyada, -10 matlab 10% kam
  adjustmentType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  // Weekend ke liye
  days: [{ type: Number }], // 0=Sunday, 1=Monday... 5=Friday, 6=Saturday

  // Seasonal ke liye
  startDate: { type: Date },
  endDate:   { type: Date },

  roomTypes: [{ type: String }], // ['single', 'double'] — empty matlab sab rooms
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);