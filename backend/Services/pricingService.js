const PricingRule = require('../Models/PricingRule');

/**
 * Kisi bhi room ke liye dynamic price calculate karo
 * @param {number} basePrice - Room ki original price
 * @param {string} roomType  - Room type (single, double etc.)
 * @param {Date}   checkIn   - Check-in date
 * @returns {object} { finalPrice, appliedRules }
 */
const calculatePrice = async (basePrice, roomType, checkIn) => {
  try {
    const date = new Date(checkIn);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

    const rules = await PricingRule.find({ isActive: true });
    let finalPrice = basePrice;
    const appliedRules = [];

    for (const rule of rules) {
      // Room type check
      if (rule.roomTypes.length > 0 && !rule.roomTypes.includes(roomType)) continue;

      let applies = false;

      if (rule.type === 'weekend' && rule.days.includes(dayOfWeek)) {
        applies = true;
      }

      if (rule.type === 'seasonal' && rule.startDate && rule.endDate) {
        if (date >= new Date(rule.startDate) && date <= new Date(rule.endDate)) {
          applies = true;
        }
      }

      if (rule.type === 'special_event' && rule.startDate && rule.endDate) {
        if (date >= new Date(rule.startDate) && date <= new Date(rule.endDate)) {
          applies = true;
        }
      }

      if (applies) {
        if (rule.adjustmentType === 'percentage') {
          finalPrice = finalPrice * (1 + rule.adjustment / 100);
        } else {
          finalPrice = finalPrice + rule.adjustment;
        }
        appliedRules.push({ name: rule.name, adjustment: rule.adjustment, type: rule.adjustmentType });
      }
    }

    return {
      basePrice,
      finalPrice: Math.round(finalPrice),
      appliedRules,
      hasDiscount: finalPrice < basePrice,
      hasSurcharge: finalPrice > basePrice,
    };
  } catch (err) {
    console.error('[PRICING SERVICE ERROR]', err.message);
    return { basePrice, finalPrice: basePrice, appliedRules: [] };
  }
};

module.exports = { calculatePrice };