import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  jwtToken: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.jwtToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;

      AsyncStorage.setItem('jwtToken', action.payload.access_token);
      AsyncStorage.setItem('refreshToken', action.payload.refresh_token);
    },
    logout: (state) => {
      state.jwtToken = null;
      state.refreshToken = null;

      AsyncStorage.clear();
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
