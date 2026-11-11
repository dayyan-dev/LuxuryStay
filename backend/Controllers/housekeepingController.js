const Housekeeping = require('../Models/Housekeeping');
const auditLog = require('../Services/auditLogService'); // ✅ ADD

// ========================
// CREATE TASK
// ========================
const createTask = async (req, res) => {
  try {
    const { roomId, assignedStaff, taskType, priority, notes, dueDate, guestRequest, roomNumber } = req.body;

    let task;
    if (guestRequest) {
      task = await Housekeeping.create({
        roomId: roomId || undefined,
        assignedStaff: undefined,
        taskType: taskType || 'room_cleaning',
        priority: priority || 'medium',
        notes: notes || '',
        dueDate: dueDate || undefined,
        guestRequest: true,
        roomNumber: roomNumber || '',
        requestedBy: req.user?._id || undefined,
      });
    } else {
      task = await Housekeeping.create({ roomId, assignedStaff, taskType, priority, notes, dueDate });
    }

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'HOUSEKEEPING_ASSIGNED',
      targetModel: 'Housekeeping',
      targetId: task._id,
      description: `Housekeeping task created — ${taskType || 'room_cleaning'} ${guestRequest ? '(guest request)' : ''}`,
      metadata: { taskType, priority, roomId, guestRequest },
    });

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to('hotel_room').emit('new_notification', {
        type: 'housekeeping',
        title: '🧹 New Housekeeping Task',
        message: `${taskType || 'Cleaning'} task assigned${guestRequest ? ' (Guest Request)' : ''}`,
        severity: priority === 'high' ? 'danger' : 'warning',
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// GET ALL TASKS
// ========================
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Housekeeping.find().lean()
      .populate('roomId', 'roomNumber type')
      .populate('assignedStaff', 'name email')
      .populate('requestedBy', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// UPDATE TASK STATUS
// ========================
const updateTaskStatus = async (req, res) => {
  try {
    const updates = { ...req.body };
    const previousTask = await Housekeeping.findById(req.params.id);

    if (req.body.cleaningStatus === 'completed') updates.completedAt = new Date();

    const task = await Housekeeping.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // ✅ AUDIT LOG
    const isCompleted = req.body.cleaningStatus === 'completed';
    await auditLog.log(req, {
      action: isCompleted ? 'HOUSEKEEPING_COMPLETED' : 'HOUSEKEEPING_ASSIGNED',
      targetModel: 'Housekeeping',
      targetId: task._id,
      description: isCompleted
        ? `Housekeeping task completed`
        : `Housekeeping task updated — status: ${req.body.cleaningStatus}`,
      metadata: {
        previousStatus: previousTask?.cleaningStatus,
        newStatus: req.body.cleaningStatus,
      },
    });

    res.status(200).json({ message: 'Task updated', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// DELETE TASK
// ========================
const deleteTask = async (req, res) => {
  try {
    const task = await Housekeeping.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createTask, getAllTasks, updateTaskStatus, deleteTask };
