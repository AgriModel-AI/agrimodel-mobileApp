// userDetailsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

// Async thunk for fetching user details
export const fetchUserDetails = createAsyncThunk('userDetails/fetchUserDetails', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/user-details`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data);
  }
});

// Async thunk for adding new user details
export const addUserDetail = createAsyncThunk('userDetails/addUserDetail', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/user-details`, userData, {
      headers: {
        "Content-Type": "multipart/form-data", // Required for FormData
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data.message);
  }
});

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState: {
    userDetails: {},
    loading: false,
    error: null,
    hasFetched: false, // New attribute to track if data has been fetched
  },
  reducers: {
    resetUserDetails(state) {
      state.userDetails = {};
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchUserDetails.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add new user details
      .addCase(addUserDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(addUserDetail.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUserDetails } = userDetailsSlice.actions;

export default userDetailsSlice.reducer;
