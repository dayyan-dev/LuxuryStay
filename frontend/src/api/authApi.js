import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email-otp',
  '/auth/resend-email-otp',
  '/auth/refresh-token',
  '/auth/2fa/verify',
  '/auth/2fa/setup-with-token',
  '/auth/2fa/enable-with-token',
];

const getValidToken = () => {
  const token = localStorage.getItem('token');
  return token && token !== 'null' && token !== 'undefined' ? token : null;
};

const clearStaffSessionAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/admin/login';
  }
};

// Axios instance — sab API calls yahan se jayengi
const api = axios.create({ baseURL: BASE_URL });

let refreshPromise = null;

// Always attach the latest valid token instead of letting components send stale or "Bearer null" headers
api.interceptors.request.use((config) => {
  const url = config.url || '';
  if (PUBLIC_AUTH_PATHS.some((p) => url.includes(p))) {
    return config;
  }

  const liveToken = getValidToken();
  if (liveToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${liveToken}`;
  } else if (
    config.headers?.Authorization === 'Bearer null' ||
    config.headers?.Authorization === 'Bearer undefined'
  ) {
    delete config.headers.Authorization;
  }
  return config;
});

// ✅ Interceptor — automatically token refresh karo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const url = originalRequest?.url || '';
    const isPublicAuth = PUBLIC_AUTH_PATHS.some((p) => url.includes(p));

    // Agar 401 aaya aur TOKEN_EXPIRED code hai aur already retry nahi kiya
    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken || refreshToken === 'null' || refreshToken === 'undefined') {
            throw new Error('Missing refresh token');
          }
          refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh-token`, { refreshToken })
            .then((res) => {
              const newToken = res.data?.token;
              if (!newToken) throw new Error('Refresh response missing token');
              localStorage.setItem('token', newToken);
              return newToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // original request dobara bhejo
      } catch {
        clearStaffSessionAndRedirect();
        return Promise.reject(error);
      }
    }

    if (
      status === 401 &&
      !isPublicAuth &&
      (code === 'TOKEN_INVALID' || code === 'TOKEN_MISSING')
    ) {
      clearStaffSessionAndRedirect();
    }

    return Promise.reject(error);
  }
);

// Auth header helper
const authHeader = () => {
  const t = getValidToken();
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
};

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