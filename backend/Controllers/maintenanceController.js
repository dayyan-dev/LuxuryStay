const Maintenance = require('../Models/Maintenance');
const Room = require('../Models/Room');
const auditLog = require('../Services/auditLogService'); // ✅ ADD

const emitRoomStatus = (io, roomId, status) => {
  if (!io || !roomId) return;
  io.to('hotel_room').emit('room_status_updated', { roomId, status });
};

// ========================
// CREATE MAINTENANCE REQUEST
// ========================
const createMaintenance = async (req, res) => {
  try {
    const { roomId, issue, issueType, priority, assignedTo, dueDate, notes } = req.body;

    let roomNumber = req.body.roomNumber || '';
    if (roomId && !roomNumber) {
      const room = await Room.findById(roomId).select('roomNumber');
      roomNumber = room?.roomNumber || '';
    }

    const maintenance = await Maintenance.create({
      roomId, issue, issueType, priority,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      notes,
      roomNumber,
      reportedBy: req.user?._id,
    });

    // Keep room board in sync with maintenance tickets
    if (roomId) {
      await Room.findByIdAndUpdate(roomId, { status: 'maintenance' });
      emitRoomStatus(req.app.get('io'), roomId, 'maintenance');
    }

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'MAINTENANCE_CREATED',
      targetModel: 'Maintenance',
      targetId: maintenance._id,
      description: `Maintenance request created — ${issueType}: ${issue}`,
      metadata: { roomId, issueType, priority, issue },
      severity: priority === 'high' ? 'warning' : 'info',
    });

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to('hotel_room').emit('new_notification', {
        type: 'maintenance',
        title: '🔧 Maintenance Request',
        message: `${issueType}: ${issue}`,
        severity: priority === 'high' ? 'danger' : 'info',
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: 'Maintenance request created', maintenance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// GET ALL MAINTENANCE
// ========================
const getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find()
      .populate('roomId', 'roomNumber type')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(maintenance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// UPDATE MAINTENANCE STATUS
// ========================
const updateMaintenanceStatus = async (req, res) => {
  try {
    const updates = { ...req.body };
    const previous = await Maintenance.findById(req.params.id);

    if (req.body.status === 'resolved') updates.resolvedAt = new Date();

    const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!maintenance) return res.status(404).json({ message: 'Not found' });

    // ✅ AUDIT LOG
    const isResolved = req.body.status === 'resolved';
    await auditLog.log(req, {
      action: isResolved ? 'MAINTENANCE_RESOLVED' : 'MAINTENANCE_CREATED',
      targetModel: 'Maintenance',
      targetId: maintenance._id,
      description: isResolved
        ? `Maintenance issue resolved`
        : `Maintenance status updated: ${previous?.status} → ${req.body.status}`,
      metadata: { previousStatus: previous?.status, newStatus: req.body.status },
    });

    // Free the room when the last open ticket for it is resolved
    if (isResolved && maintenance.roomId) {
      const openCount = await Maintenance.countDocuments({
        roomId: maintenance.roomId,
        status: { $ne: 'resolved' },
      });
      if (openCount === 0) {
        await Room.findByIdAndUpdate(maintenance.roomId, { status: 'available' });
        emitRoomStatus(req.app.get('io'), maintenance.roomId, 'available');
      }
    }

    res.status(200).json({ message: 'Updated', maintenance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// DELETE MAINTENANCE
// ========================
const deleteMaintenance = async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createMaintenance, getAllMaintenance, updateMaintenanceStatus, deleteMaintenance };
