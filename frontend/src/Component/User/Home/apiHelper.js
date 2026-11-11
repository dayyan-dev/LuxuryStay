/* eslint-disable no-unused-vars */
import axios from 'axios';

/**
 * Wrapper jo automatically token refresh karta hai agar 401 aaye.
 * Usage: await apiCall(token, refreshAccessToken, (currentToken) =>
 *   axios.post(url, data, { headers: { Authorization: `Bearer ${currentToken}` } })
 * );
 */
export const apiCall = async (token, refreshAccessToken, requestFn) => {
  try {
    return await requestFn(token);
  } catch (err) {
    if (err.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw err;
      return await requestFn(newToken);
    }
    throw err;
  }
};