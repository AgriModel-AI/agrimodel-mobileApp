import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserDetails } from './slices/userDetailsSlice';

// Create store
export const store = configureStore({
  reducer: rootReducer,
});

// Function to load tokens and dispatch them
const loadTokens = async () => {
  try {
    const jwtToken = await AsyncStorage.getItem('jwtToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (jwtToken && refreshToken) {
      store.dispatch({
        type: 'user/login',
        payload: { access_token: jwtToken, refresh_token: refreshToken },
      });
    }

    store.dispatch(fetchUserDetails());
    
  } catch (error) {
    console.error('Error loading tokens:', error);
  }
};

// Call function after store is created
loadTokens();

export default store;
