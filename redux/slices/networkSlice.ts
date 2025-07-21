import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isConnected: boolean;
  lastConnected: string | null;
}

const initialState: NetworkState = {
  isConnected: true,
  lastConnected: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkStatus(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
      if (action.payload) {
        state.lastConnected = new Date().toISOString();
      }
    },
  },
});

export const { setNetworkStatus } = networkSlice.actions;
export default networkSlice.reducer;