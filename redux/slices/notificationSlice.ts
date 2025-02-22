import axiosInstance from '@/utils/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/notifications');
      return response.data.data; // Assuming API response has a `data` key
    } catch (error:any) {
      return rejectWithValue(error.response?.data || "Error fetching notifications");
    }
  }
);

// Async thunk for marking notifications as read
export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/notifications');
      return response.data.message; // Assuming API response has a `message` key
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Error marking notifications as read");
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
    hasFetched: false, // Tracks if notifications have been fetched
  },
  reducers: {
    resetNotifications(state) {
      state.notifications = [];
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    // Handle fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchNotifications.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle mark notifications as read
    builder
      .addCase(markNotificationsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationsAsRead.fulfilled, (state: any, action) => {
        state.loading = false;
        // Update state to mark all notifications as read
        state.notifications = state.notifications.map((notification: any) => ({
          ...notification,
          isRead: true,
        }));
      })
      .addCase(markNotificationsAsRead.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
