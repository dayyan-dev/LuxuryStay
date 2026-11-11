const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // null for system actions
    },
    performedByName: {
      type: String,
      default: 'System',
    },
    performedByRole: {
      type: String,
      default: 'system',
    },

    // What action was performed
    action: {
      type: String,
      required: true,
      enum: [
        // Auth
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_REGISTER',
        'PASSWORD_CHANGED',
        'LOGIN_FAILED',

        // Users
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DELETED',
        'USER_SUSPENDED',

        // Bookings
        'BOOKING_CREATED',
        'BOOKING_UPDATED',
        'BOOKING_CANCELLED',
        'BOOKING_CHECKED_IN',
        'BOOKING_CHECKED_OUT',

        // Rooms
        'ROOM_CREATED',
        'ROOM_UPDATED',
        'ROOM_DELETED',
        'ROOM_STATUS_CHANGED',

        // Payments
        'PAYMENT_RECEIVED',
        'PAYMENT_REFUNDED',

        // Housekeeping
        'HOUSEKEEPING_ASSIGNED',
        'HOUSEKEEPING_COMPLETED',

        // Maintenance
        'MAINTENANCE_CREATED',
        'MAINTENANCE_RESOLVED',

        // Restaurant
        'ORDER_PLACED',
        'ORDER_UPDATED',

        // Settings
        'SETTINGS_UPDATED',

        // System
        'SYSTEM_EVENT',
      ],
    },

    // What was affected
    targetModel: {
      type: String,
      enum: ['User', 'Booking', 'Room', 'Payment', 'Housekeeping', 'Maintenance', 'Order', 'Settings', null],
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Details
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // extra data (old value, new value etc.)
      default: {},
    },

    // Request info
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },

    // Severity
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
