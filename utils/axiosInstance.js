import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api/v1`,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  async config => {
    console.log("Hereeeeeee")
    // Get the token from SecureStore
    const token = await SecureStore.getItemAsync('jwtToken');
    console.log("adding")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    console.log("not found")
    console.log(error)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized, redirecting to login...');
      // Handle token expiry logic
      // You might want to clear the token from SecureStore here
      await SecureStore.deleteItemAsync('jwtToken');
      // Navigate to the login screen
      // For navigation, use the appropriate React Navigation method or redirect logic
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
