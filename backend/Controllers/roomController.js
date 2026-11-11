const Room = require('../Models/Room');
const Hotel = require('../Models/Hotel');
const auditLog = require('../Services/auditLogService'); // ✅ ADD
const { reconcileRoomStatuses } = require('../Services/roomStatusService');
const { annotateRoomsAvailability } = require('../Services/roomAvailabilityService');

// ========================
// ADD ROOM
// ========================
const addRoom = async (req, res) => {
  try {
    const imagePaths = req.files?.map((file) => file.filename);

    const room = await Room.create({
      ...req.body,
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [req.body.amenities],
      images: imagePaths,
    });

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'ROOM_CREATED',
      targetModel: 'Room',
      targetId: room._id,
      description: `New room added — Room ${room.roomNumber} (${room.type})`,
      metadata: { roomNumber: room.roomNumber, type: room.type, price: room.price },
    });

    res.status(201).json({ message: 'Room added successfully', room });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// GET ALL ROOMS
// Optional query: hotelId, city, checkIn, checkOut, guests
// ========================
const getAllRooms = async (req, res) => {
  try {
    // Heal stuck occupied rooms before returning list
    await reconcileRoomStatuses(req.app.get('io'));

    const { hotelId, city, checkIn, checkOut, guests } = req.query;
    const filter = {};

    if (hotelId) {
      filter.hotelId = hotelId;
    } else if (city && String(city).toLowerCase() !== 'all') {
      const hotels = await Hotel.find({
        city: new RegExp(`^${String(city).trim()}$`, 'i'),
        status: { $ne: 'inactive' },
      }).select('_id');
      filter.hotelId = { $in: hotels.map((h) => h._id) };
    } else {
      // Guest catalog: only property-linked inventory (no legacy shared rooms)
      filter.hotelId = { $exists: true, $ne: null };
    }

    let rooms = await Room.find(filter).populate('hotelId', 'name city slug');

    if (guests) {
      const need = Number(guests) || 0;
      if (need > 0) {
        rooms = rooms.filter((r) => Number(r.capacity || 0) >= need);
      }
    }

    const annotated = await annotateRoomsAvailability(rooms, checkIn, checkOut);
    res.status(200).json(annotated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// GET SINGLE ROOM
// ========================
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId', 'name city slug');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const { checkIn, checkOut } = req.query;
    const [annotated] = await annotateRoomsAvailability([room], checkIn, checkOut);
    res.status(200).json(annotated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// UPDATE ROOM
// ========================
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const imagePaths = req.files?.map((file) => file.filename);
    const updatedData = { ...req.body };
    updatedData.images = imagePaths?.length > 0 ? imagePaths : room.images;

    const previousStatus = room.status;
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    // ✅ AUDIT LOG
    const statusChanged = updatedData.status && updatedData.status !== previousStatus;
    await auditLog.log(req, {
      action: statusChanged ? 'ROOM_STATUS_CHANGED' : 'ROOM_UPDATED',
      targetModel: 'Room',
      targetId: room._id,
      description: statusChanged
        ? `Room ${room.roomNumber} status: ${previousStatus} → ${updatedData.status}`
        : `Room ${room.roomNumber} details updated`,
      metadata: { roomNumber: room.roomNumber, changes: updatedData, previousStatus },
    });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to('hotel_room').emit('room_status_updated', {
        roomId: updatedRoom._id,
        roomNumber: updatedRoom.roomNumber,
        status: updatedRoom.status,
        type: updatedRoom.type,
      });
    }

    res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ========================
// DELETE ROOM
// ========================
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (['occupied', 'reserved', 'cleaning', 'maintenance'].includes(room.status)) {
      return res.status(400).json({ message: 'Cannot delete active room' });
    }

    await Room.findByIdAndDelete(req.params.id);

    // ✅ AUDIT LOG
    await auditLog.log(req, {
      action: 'ROOM_DELETED',
      targetModel: 'Room',
      targetId: req.params.id,
      description: `Room ${room.roomNumber} deleted`,
      metadata: { roomNumber: room.roomNumber, type: room.type },
      severity: 'warning',
    });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addRoom, getAllRooms, getRoomById, updateRoom, deleteRoom };
