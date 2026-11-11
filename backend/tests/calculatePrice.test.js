/**
 * Unit tests — calculatePrice (dynamic pricing service)
 * DB access is stubbed so these run without MongoDB.
 * Run: npm test
 */
const { expect } = require('chai');
const sinon = require('sinon');
const PricingRule = require('../Models/PricingRule');
const { calculatePrice } = require('../Services/pricingService');

describe('calculatePrice', () => {
  let sandbox;

  beforeEach(() => { sandbox = sinon.createSandbox(); });
  afterEach(() => sandbox.restore());

  const rulesStub = (rules) => sandbox.stub(PricingRule, 'find').returns(Promise.resolve(rules));

  it('returns base price when no rules exist', async () => {
    rulesStub([]);
    const r = await calculatePrice(5000, 'double', '2026-11-01');
    expect(r.finalPrice).to.equal(5000);
    expect(r.hasDiscount).to.equal(false);
    expect(r.hasSurcharge).to.equal(false);
  });

  it('applies a percentage weekend surcharge on Saturday', async () => {
    rulesStub([{ name: 'Weekend', type: 'weekend', days: [6], roomTypes: [], adjustment: 20, adjustmentType: 'percentage', isActive: true }]);
    // 2026-10-24 is a Saturday
    const r = await calculatePrice(5000, 'double', '2026-10-24');
    expect(r.finalPrice).to.equal(6000);
    expect(r.hasSurcharge).to.equal(true);
    expect(r.appliedRules).to.have.lengthOf(1);
  });

  it('does NOT apply weekend rule on a Tuesday', async () => {
    rulesStub([{ name: 'Weekend', type: 'weekend', days: [0, 6], roomTypes: [], adjustment: 20, adjustmentType: 'percentage', isActive: true }]);
    // 2026-10-27 is a Tuesday
    const r = await calculatePrice(5000, 'double', '2026-10-27');
    expect(r.finalPrice).to.equal(5000);
  });

  it('applies seasonal discount within date range', async () => {
    rulesStub([{ name: 'Winter', type: 'seasonal', startDate: '2026-12-01', endDate: '2026-12-31', roomTypes: [], adjustment: -10, adjustmentType: 'percentage', isActive: true }]);
    const r = await calculatePrice(5000, 'suite', '2026-12-15');
    expect(r.finalPrice).to.equal(4500);
    expect(r.hasDiscount).to.equal(true);
  });

  it('does NOT apply seasonal rule outside its range', async () => {
    rulesStub([{ name: 'Winter', type: 'seasonal', startDate: '2026-12-01', endDate: '2026-12-31', roomTypes: [], adjustment: -10, adjustmentType: 'percentage', isActive: true }]);
    const r = await calculatePrice(5000, 'suite', '2026-11-15');
    expect(r.finalPrice).to.equal(5000);
  });

  it('applies flat-amount special event rule', async () => {
    rulesStub([{ name: 'NewYear', type: 'special_event', startDate: '2026-12-31', endDate: '2026-12-31', roomTypes: [], adjustment: 2000, adjustmentType: 'amount', isActive: true }]);
    const r = await calculatePrice(5000, 'deluxe', '2026-12-31');
    expect(r.finalPrice).to.equal(7000);
  });

  it('skips rules filtered out by roomType', async () => {
    rulesStub([{ name: 'SuiteOnly', type: 'weekend', days: [6], roomTypes: ['suite'], adjustment: 50, adjustmentType: 'percentage', isActive: true }]);
    const r = await calculatePrice(4000, 'double', '2026-10-24');
    expect(r.finalPrice).to.equal(4000);
  });

  it('compounds multiple matching rules', async () => {
    rulesStub([
      { name: 'Weekend', type: 'weekend', days: [6], roomTypes: [], adjustment: 10, adjustmentType: 'percentage', isActive: true },
      { name: 'Event', type: 'special_event', startDate: '2026-10-24', endDate: '2026-10-24', roomTypes: [], adjustment: 500, adjustmentType: 'amount', isActive: true },
    ]);
    const r = await calculatePrice(1000, 'single', '2026-10-24');
    // 1000 * 1.10 = 1100, + 500 = 1600
    expect(r.finalPrice).to.equal(1600);
    expect(r.appliedRules).to.have.lengthOf(2);
  });

  it('ignores inactive rules', async () => {
    rulesStub([]);
    const r = await calculatePrice(5000, 'double', '2026-10-24');
    expect(r.finalPrice).to.equal(5000);
  });

  it('rounds fractional prices', async () => {
    rulesStub([{ name: 'Odd', type: 'weekend', days: [6], roomTypes: [], adjustment: 3.5, adjustmentType: 'percentage', isActive: true }]);
    const r = await calculatePrice(999, 'single', '2026-10-24');
    expect(r.finalPrice).to.equal(Math.round(999 * 1.035));
  });
});
