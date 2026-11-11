const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../Middleware/authMiddleware');
const {
  getAuditLogs,
  getUserAuditLogs,
  getSecurityEvents,
  getAuditSummary,
} = require('../Controllers/auditLogController');

// All audit log routes require admin access
router.use(protect, adminOnly);

router.get('/', getAuditLogs);                        // GET /api/audit-logs
router.get('/summary', getAuditSummary);              // GET /api/audit-logs/summary
router.get('/security', getSecurityEvents);           // GET /api/audit-logs/security
router.get('/user/:userId', getUserAuditLogs);        // GET /api/audit-logs/user/:userId

module.exports = router;
