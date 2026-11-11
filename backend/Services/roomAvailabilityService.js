const Booking = require('../Models/Booking');

const ACTIVE_STATUSES = ['pending', 'confirmed', 'checked_in'];
const HARD_BLOCK_STATUSES = ['maintenance', 'cleaning', 'inactive'];

/**
 * Find roomIds that already have an overlapping active booking.
 */
async function getBusyRoomIds(roomIds, checkIn, checkOut) {
  if (!roomIds?.length || !checkIn || !checkOut) return new Set();

  const cin = new Date(checkIn);
  const cout = new Date(checkOut);
  if (isNaN(cin.getTime()) || isNaN(cout.getTime()) || cout <= cin) {
    return new Set();
  }

  const conflicts = await Booking.find({
    roomId: { $in: roomIds },
    bookingStatus: { $in: ACTIVE_STATUSES },
    checkInDate: { $lt: cout },
    checkOutDate: { $gt: cin },
  }).select('roomId');

  return new Set(conflicts.map((c) => String(c.roomId)));
}

function isHardBlockedStatus(status) {
  return HARD_BLOCK_STATUSES.includes(String(status || '').toLowerCase());
}

/**
 * Annotate room docs/objects with availableForDates when stay range is provided.
 */
async function annotateRoomsAvailability(rooms, checkIn, checkOut) {
  const list = Array.isArray(rooms) ? rooms : [];
  if (!checkIn || !checkOut) {
    return list.map((r) => {
      const obj = typeof r.toObject === 'function' ? r.toObject() : { ...r };
      obj.availableForDates = !isHardBlockedStatus(obj.status);
      return obj;
    });
  }

  const ids = list.map((r) => r._id);
  const busy = await getBusyRoomIds(ids, checkIn, checkOut);

  return list.map((r) => {
    const obj = typeof r.toObject === 'function' ? r.toObject() : { ...r };
    const hardBlocked = isHardBlockedStatus(obj.status);
    const dateBusy = busy.has(String(obj._id));
    obj.availableForDates = !hardBlocked && !dateBusy;
    obj.dateConflict = dateBusy;
    return obj;
  });
}

module.exports = {
  getBusyRoomIds,
  annotateRoomsAvailability,
  isHardBlockedStatus,
  ACTIVE_STATUSES,
};
