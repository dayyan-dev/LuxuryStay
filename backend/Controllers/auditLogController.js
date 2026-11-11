const AuditLog = require('../Models/AuditLog');

// ============================================================
// GET ALL AUDIT LOGS (Admin only)
// GET /api/audit-logs?page=1&limit=50&action=BOOKING_CREATED&severity=critical
// ============================================================
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      severity,
      performedBy,
      targetModel,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (action) filter.action = action;
    if (severity) filter.severity = severity;
    if (performedBy) filter.performedBy = performedBy;
    if (targetModel) filter.targetModel = targetModel;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// GET LOGS FOR A SPECIFIC USER
// GET /api/audit-logs/user/:userId
// ============================================================
const getUserAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ performedBy: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// GET CRITICAL SECURITY EVENTS
// GET /api/audit-logs/security
// ============================================================
const getSecurityEvents = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      $or: [
        { severity: 'critical' },
        { action: 'LOGIN_FAILED' },
        { action: 'USER_SUSPENDED' },
      ],
    })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================
// GET AUDIT LOG SUMMARY (Dashboard widget)
// GET /api/audit-logs/summary
// ============================================================
const getAuditSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCount, criticalCount, recentLogs] = await Promise.all([
      AuditLog.countDocuments({ createdAt: { $gte: today } }),
      AuditLog.countDocuments({ severity: 'critical', createdAt: { $gte: today } }),
      AuditLog.find()
        .populate('performedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        todayCount,
        criticalCount,
        recentLogs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAuditLogs,
  getUserAuditLogs,
  getSecurityEvents,
  getAuditSummary,
};
