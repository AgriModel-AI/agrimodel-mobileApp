import axiosInstance from '@/utils/axiosInstance';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../persistConfig';

// Define types
interface UserDetails {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface UserDetailsState {
  userDetails: UserDetails | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  lastFetched: string | null; // Track when data was last fetched
  pendingActions: {
    type: string;
    payload: any;
    timestamp: string;
  }[];
}

// Initial state
const initialState: UserDetailsState = {
  userDetails: null,
  loading: false,
  error: null,
  hasFetched: false,
  lastFetched: null,
  pendingActions: [],
};

// Async thunk for fetching user details
export const fetchUserDetails = createAsyncThunk<
  UserDetails,
  void,
  { rejectValue: string; state: RootState }
>('userDetails/fetchUserDetails', async (_, { rejectWithValue, getState }) => {
  // Check if we're online
  const isConnected = getState().network.isConnected;

  if (!isConnected) {
    // If offline and we have cached data, use it
    const cachedData = getState().userDetails.userDetails;
    if (cachedData) {
      return cachedData; // Return cached data
    }
    return rejectWithValue('Offline and no cached data available');
  }

  try {
    const response = await axiosInstance.get<UserDetails>(`/user-details`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch user details'
    );
  }
});

// Async thunk for adding new user details
export const addUserDetail = createAsyncThunk<
  UserDetails,
  FormData,
  { rejectValue: string; state: RootState }
>('userDetails/addUserDetail', async (userData, { rejectWithValue, getState, dispatch }) => {
  const isConnected = getState().network.isConnected;

  if (!isConnected) {
    // Store action for later execution
    dispatch(
      queueAction({
        type: 'userDetails/addUserDetail',
        payload: userData,
        timestamp: new Date().toISOString(),
      })
    );
    
    // Return current data plus optimistic update
    const currentData = getState().userDetails.userDetails;
    // This is a simplified approach; in real apps, you would need a more robust
    // way to handle optimistic updates, especially for FormData objects
    return currentData as UserDetails;
  }

  try {
    const response = await axiosInstance.post<UserDetails>(`/user-details`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to add user details'
    );
  }
});

export const addDistrict = createAsyncThunk<
  any,
  FormData,
  { rejectValue: string; state: RootState }
>('userDetails/addDistrict', async (userData, { rejectWithValue, getState, dispatch }) => {
  const isConnected = getState().network.isConnected;

  if (!isConnected) {
    // Store action for later execution
    dispatch(
      queueAction({
        type: 'userDetails/addDistrict',
        payload: userData,
        timestamp: new Date().toISOString(),
      })
    );
    
    // Return current data + optimistic update
    const currentData = getState().userDetails.userDetails;
    return currentData;
  }

  try {
    const response = await axiosInstance.post<UserDetails>(`/user-details/district`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to add district'
    );
  }
});

// New thunk to process pending actions when back online
export const processPendingActions = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('userDetails/processPendingActions', async (_, { dispatch, getState }) => {
  const pendingActions = getState().userDetails.pendingActions;
  
  // Process actions in order they were created
  for (const action of pendingActions) {
    if (action.type === 'userDetails/addUserDetail') {
      await dispatch(addUserDetail(action.payload));
    } else if (action.type === 'userDetails/addDistrict') {
      await dispatch(addDistrict(action.payload));
    }
    // Add other action types as needed
  }
  
  // Clear pending actions after processing
  dispatch(clearPendingActions());
});

// Create slice
const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    resetUserDetails(state) {
      state.userDetails = null;
      state.error = null;
      state.hasFetched = false;
      state.lastFetched = null;
    },
    queueAction(state, action: PayloadAction<{ type: string; payload: any; timestamp: string }>) {
      state.pendingActions.push(action.payload);
    },
    clearPendingActions(state) {
      state.pendingActions = [];
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
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
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
        state.lastFetched = new Date().toISOString();
      })
      .addCase(addUserDetail.rejected, (state, action) => {
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
        state.lastFetched = new Date().toISOString();
      })
      .addCase(addDistrict.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      });
  },
});

export const { resetUserDetails, queueAction, clearPendingActions } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;