const AuditLog = require('../Models/AuditLog');

// ============================================================
// AUDIT LOG SERVICE
// Call this anywhere in controllers to log actions
// ============================================================

/**
 * Log an action to the audit trail
 *
 * Usage:
 *   await auditLog.log(req, {
 *     action: 'BOOKING_CREATED',
 *     targetModel: 'Booking',
 *     targetId: booking._id,
 *     description: `New booking created for room ${room.roomNumber}`,
 *     metadata: { roomNumber: room.roomNumber, totalAmount: booking.totalAmount }
 *   });
 */
const log = async (req, { action, targetModel, targetId, description, metadata = {}, severity = 'info', performedByName, performedByRole } = {}) => {
  try {
    await AuditLog.create({
      performedBy: req?.user?._id || null,
      performedByName: req?.user?.name || performedByName || req?.body?.email || 'System',
      performedByRole: req?.user?.role || performedByRole || 'system',
      action,
      targetModel: targetModel || null,
      targetId: targetId || null,
      description,
      metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
      severity,
    });
  } catch (err) {
    // Never let audit log failure crash the main request
    console.error('[AUDIT LOG ERROR]', err.message);
  }
};

/**
 * Log a system event (no request context)
 */
const logSystem = async ({ action, description, metadata = {}, severity = 'info' }) => {
  try {
    await AuditLog.create({
      performedBy: null,
      performedByName: 'System',
      performedByRole: 'system',
      action,
      description,
      metadata,
      severity,
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
};

module.exports = { log, logSystem };
