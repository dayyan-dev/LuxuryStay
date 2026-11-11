const KEY = 'luxurystay_stay_search';

export function saveStaySearch( partial = {} ) {
  try {
    const prev = loadStaySearch();
    const next = { ...prev, ...partial, updatedAt: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return partial;
  }
}

export function loadStaySearch() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function stayQueryFrom(obj = {}) {
  const q = new URLSearchParams();
  ['checkIn', 'checkOut', 'guests', 'rooms', 'city', 'promo'].forEach((key) => {
    const v = obj[key];
    if (v != null && String(v).trim() !== '') q.set(key, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function mergeStayParams(searchParams) {
  const fromUrl = {
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '',
    rooms: searchParams.get('rooms') || '',
    city: searchParams.get('city') || '',
    promo: searchParams.get('promo') || '',
  };
  const fromSession = loadStaySearch();
  return {
    checkIn: fromUrl.checkIn || fromSession.checkIn || '',
    checkOut: fromUrl.checkOut || fromSession.checkOut || '',
    guests: fromUrl.guests || fromSession.guests || '',
    rooms: fromUrl.rooms || fromSession.rooms || '',
    city: fromUrl.city || fromSession.city || '',
    promo: fromUrl.promo || fromSession.promo || '',
  };
}
