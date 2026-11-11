const SERVER_URL = (
  process.env.REACT_APP_SERVER_URL ||
  (process.env.REACT_APP_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '') ||
  'http://localhost:5001'
).replace(/\/$/, '');

/** Resolve uploaded / remote image paths consistently (never /api/Uploads). */
export function getUploadUrl(img, fallback = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80') {
  if (!img) return fallback;
  if (typeof img !== 'string') return fallback;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;

  let path = img.replace(/\\/g, '/').replace(/^\/+/, '');
  // Normalize accidental api/Uploads or mixed-case uploads folders
  path = path.replace(/^api\/Uploads\//i, 'Uploads/');
  if (/^uploads\//i.test(path)) {
    path = `Uploads/${path.replace(/^uploads\//i, '')}`;
  } else if (!/^Uploads\//i.test(path)) {
    path = `Uploads/${path}`;
  }
  return `${SERVER_URL}/${path}`;
}

export function formatRoomTitle(room) {
  if (!room) return 'Room';
  if (room.title) return room.title;
  const type = (room.type || 'Room').toString().trim();
  const pretty = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (/suite/i.test(pretty)) return pretty;
  return `${pretty} Room`;
}

export function formatRoomTypeLabel(type) {
  if (!type) return 'Room';
  const pretty = type.toString().trim();
  return pretty.charAt(0).toUpperCase() + pretty.slice(1).toLowerCase();
}

/** Hard-block booking CTAs (maintenance / cleaning / inactive). Occupied still bookable for other dates. */
export function isRoomBookingBlocked(status) {
  return ['maintenance', 'cleaning', 'inactive'].includes(
    String(status || '').toLowerCase()
  );
}

/**
 * Guest listing helper: hard status block OR date-range conflict from API
 * (`availableForDates === false` / `dateConflict`).
 */
export function isRoomUnavailableForStay(room) {
  if (!room) return true;
  if (isRoomBookingBlocked(room.status)) return true;
  if (room.availableForDates === false) return true;
  if (room.dateConflict === true) return true;
  return false;
}

export function getRoomStatusMeta(status) {
  const key = String(status || '').toLowerCase();
  const labels = {
    available: { text: 'Available', color: '#27ae60', bg: 'rgba(54,133,104,0.12)', border: 'rgba(54,133,104,0.25)' },
    booked: { text: 'Reserved Dates', color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', border: 'rgba(155,89,182,0.2)' },
    reserved: { text: 'Reserved', color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', border: 'rgba(155,89,182,0.2)' },
    occupied: { text: 'Currently Occupied', color: '#e67e22', bg: 'rgba(230,126,34,0.1)', border: 'rgba(230,126,34,0.2)' },
    maintenance: { text: 'Under Maintenance', color: '#7f8c8d', bg: 'rgba(127,140,141,0.12)', border: 'rgba(127,140,141,0.25)' },
    cleaning: { text: 'Being Cleaned', color: '#3498db', bg: 'rgba(52,152,219,0.1)', border: 'rgba(52,152,219,0.2)' },
    inactive: { text: 'Unavailable', color: '#CC5B55', bg: 'rgba(231,76,60,0.1)', border: 'rgba(231,76,60,0.2)' },
  };
  return labels[key] || null;
}
