import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5001/api') + '/hotels';

export const getHotels = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_BASE}${query ? `?${query}` : ''}`);
  return res.data;
};

export const getFeaturedHotels = async () => {
  const res = await axios.get(`${API_BASE}/featured`);
  return res.data?.data || [];
};
export const getFeatureHotels = getFeaturedHotels;

export const getHotelCities = async () => {
  const res = await axios.get(`${API_BASE}/cities`);
  return res.data?.data || [];
};

export const getHotelById = async (id, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && String(value).trim() !== '') query.set(key, value);
  });
  const qs = query.toString();
  const res = await axios.get(`${API_BASE}/${id}${qs ? `?${qs}` : ''}`);
  return res.data?.data;
};

