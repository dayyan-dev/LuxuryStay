const Room = require('../Models/Room');
const Booking = require('../Models/Booking');
const Maintenance = require('../Models/Maintenance');

/**
 * Keep room.status aligned with live bookings + open maintenance tickets.
 * Priority: checked_in → occupied, else open maintenance → maintenance,
 * else clear stuck occupied → available. Does not override cleaning.
 */
async function reconcileRoomStatuses(io) {
  const [checkedIn, openMaint] = await Promise.all([
    Booking.find({ bookingStatus: 'checked_in' }).select('roomId'),
    Maintenance.find({ status: { $ne: 'resolved' } }).select('roomId'),
  ]);

  const occupiedIds = new Set(
    checkedIn.map((b) => String(b.roomId)).filter(Boolean)
  );
  const maintenanceIds = new Set(
    openMaint.map((m) => String(m.roomId)).filter((id) => id && id !== 'undefined' && id !== 'null')
  );

  const rooms = await Room.find().select('_id roomNumber status');
  const updates = [];

  const setStatus = (room, status) => {
    updates.push(
      Room.findByIdAndUpdate(room._id, { status }).then(() => {
        if (io) {
          io.to('hotel_room').emit('room_status_updated', {
            roomId: room._id,
            status,
          });
        }
      })
    );
  };

  for (const room of rooms) {
    const id = String(room._id);
    const shouldBeOccupied = occupiedIds.has(id);
    const shouldBeMaintenance = maintenanceIds.has(id);

    let desired = room.status;
    if (shouldBeOccupied) {
      desired = 'occupied';
    } else if (shouldBeMaintenance) {
      desired = 'maintenance';
    } else if (room.status === 'occupied' || room.status === 'maintenance') {
      // Stuck occupied/maintenance with no live reason → free the room
      // Leave intentional cleaning alone
      desired = 'available';
    }

    if (desired !== room.status) {
      setStatus(room, desired);
    }
  }

  if (updates.length) await Promise.all(updates);
  return { fixed: updates.length };
}

module.exports = { reconcileRoomStatuses };
