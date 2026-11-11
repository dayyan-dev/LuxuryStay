import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('user_token');
    const savedUser  = localStorage.getItem('user_data');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken, userRefreshToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user_token',        userToken);
    localStorage.setItem('user_refreshToken', userRefreshToken);
    localStorage.setItem('user_data',         JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      const savedToken = localStorage.getItem('user_token');
      if (savedToken) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
      }
    } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_refreshToken');
    localStorage.removeItem('user_data');
    // Clear legacy guest keys so contact/profile never mix stale sessions
    localStorage.removeItem('hotelUser');
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('user_refreshToken');
      if (!refreshToken) { logout(); return null; }
      const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem('user_token', newToken);
      return newToken;
    } catch {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);