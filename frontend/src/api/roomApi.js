const BASE_URL = (process.env.REACT_APP_SERVER_URL || "http://localhost:5001");

export const getRooms = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && String(value).trim() !== '') {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  const res = await fetch(`${BASE_URL}/api/rooms${qs ? `?${qs}` : ''}`);
  return res.json();
};

export const getSingleRoom = async (id, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && String(value).trim() !== '') {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  const res = await fetch(`${BASE_URL}/api/rooms/${id}${qs ? `?${qs}` : ''}`);
  return res.json();
};
