import axios from 'axios';
import { router } from 'expo-router';

import TokenManager from '../services/storage/TokenManager';

const axiosInstance = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1`,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Function to get stored tokens

// Function to refresh token
const refreshAccessToken = async () => {
  try {
    const refreshToken = await TokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/refresh-token`, {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });

    const { access_token, refresh_token } = response.data;

    // Store new tokens
    await TokenManager.setTokens(access_token, refresh_token);

    return access_token;
  } catch (error) {
    // console.error("Failed to refresh access token", error);
    await TokenManager.clearTokens();
    return null;
  }
};

// Request Interceptor: Attach access token
axiosInstance.interceptors.request.use(
  async config => {
    const accessToken = await TokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor: Handle 401 errors and retry requests
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to prevent infinite loops
      
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest); // Retry the failed request with the new token
      }else{
        router.push('/(auth)/login');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
