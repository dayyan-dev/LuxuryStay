import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5001/api') + '/offers';

export const getOffers = async () => {
  const res = await axios.get(API_BASE);
  return res.data?.data || [];
};

export const getOfferById = async (id) => {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data?.data;
};

export const validatePromoCode = async ({ code, totalAmount, nights = 1, hotelId }) => {
  const res = await axios.post(`${API_BASE}/validate`, {
    code,
    totalAmount,
    nights,
    hotelId,
  });
  return res.data;
};

