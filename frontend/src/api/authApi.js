import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Axios instance — sab API calls yahan se jayengi
const api = axios.create({ baseURL: BASE_URL });

// ✅ Interceptor — automatically token refresh karo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Agar 401 aaya aur TOKEN_EXPIRED code hai aur already retry nahi kiya
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest); // original request dobara bhejo
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth header helper
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const registerUser = async (formData) => {
  const res = await api.post('/auth/register', formData);
  return res.data;
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const res = await api.post('/auth/verify-email-otp', { email, otp });
  return res.data;
};

export const resendEmailOtp = async ({ email }) => {
  const res = await api.post('/auth/resend-email-otp', { email });
  return res.data;
};

export const loginUser = async (formData) => {
  const res = await api.post('/auth/login', formData);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile', authHeader());
  return res.data;
};

export default api; // dusri jagah bhi yahi axios instance use karo