import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

// Define types
interface UserDetails {
  id: string;
  name: string;
  email: string;
  [key: string]: any; // For additional user properties
}

interface UserDetailsState {
  userDetails: UserDetails | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
}

// Initial state
const initialState: UserDetailsState = {
  userDetails: null,
  loading: false,
  error: null,
  hasFetched: false,
};

// Async thunk for fetching user details
export const fetchUserDetails = createAsyncThunk<UserDetails, void, { rejectValue: string }>(
  'userDetails/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<UserDetails>(`/user-details`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

// Async thunk for adding new user details
export const addUserDetail = createAsyncThunk<UserDetails, FormData, { rejectValue: string }>(
  'userDetails/addUserDetail',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<UserDetails>(`/user-details`, userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add user details');
    }
  }
);


export const addDistrict = createAsyncThunk<any, FormData, { rejectValue: string }>(
  'userDetails/addDistrict',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<UserDetails>(`/user-details/district`, userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add user details');
    }
  }
);

// Create slice
const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    resetUserDetails(state) {
      state.userDetails = null;
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<UserDetails>) => {
        state.loading = false;
        state.userDetails = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchUserDetails.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      })
      .addCase(addUserDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserDetail.fulfilled, (state, action: PayloadAction<UserDetails>) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(addUserDetail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      })
      .addCase(addDistrict.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDistrict.fulfilled, (state, action: PayloadAction<UserDetails>) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(addDistrict.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      });
  },
});

export const { resetUserDetails } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
