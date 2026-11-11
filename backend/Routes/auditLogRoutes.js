const express = require('express');
const router = express.Router();
const { protect, managerOrAdmin } = require('../Middleware/authMiddleware');
const {
  getAuditLogs,
  getUserAuditLogs,
  getSecurityEvents,
  getAuditSummary,
} = require('../Controllers/auditLogController');

// Audit log routes allow Admin & General Manager access
router.use(protect, managerOrAdmin);

router.get('/', getAuditLogs);                        // GET /api/audit-logs
router.get('/summary', getAuditSummary);              // GET /api/audit-logs/summary
router.get('/security', getSecurityEvents);           // GET /api/audit-logs/security
router.get('/user/:userId', getUserAuditLogs);        // GET /api/audit-logs/user/:userId

module.exports = router;
