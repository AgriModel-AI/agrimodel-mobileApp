import NetworkService from '@/services/NetworkService';
import SubscriptionService, { SubscriptionUsage } from '@/services/storage/SubscriptionService';
import axiosInstance from '@/utils/axiosInstance';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../persistConfig';

interface SubscriptionState {
  currentUsage: SubscriptionUsage | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: SubscriptionState = {
  currentUsage: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchSubscriptionUsage = createAsyncThunk<
  SubscriptionUsage | null,
  boolean | undefined,
  { state: RootState }
>('subscription/fetchUsage', async (forceRefresh = false, { getState }) => {
  return await SubscriptionService.fetchSubscriptionUsage(forceRefresh);
});

export const recordUsageAttempt = createAsyncThunk<
  SubscriptionUsage | null,
  void,
  { state: RootState }
>('subscription/recordUsage', async (_, { getState }) => {
  return await SubscriptionService.recordUsageAttempt();
});

export const subscribeToNewPlan = createAsyncThunk<
  SubscriptionUsage | null,
  { planId: number; subscriptionType: 'monthly' | 'yearly'; paymentMethod: string; transactionId: string },
  { state: RootState; rejectValue: string }
>('subscription/subscribe', async (subscriptionData, { rejectWithValue }) => {
  if (!NetworkService.isNetworkConnected()) {
    return rejectWithValue('Cannot subscribe while offline');
  }

  try {
    // Make API call to subscribe
    await axiosInstance.post(`/subscriptions`, subscriptionData);
    
    // Get updated usage
    return await SubscriptionService.fetchSubscriptionUsage(true);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create subscription'
    );
  }
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    resetSubscription(state) {
      state.currentUsage = null;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUsage = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchSubscriptionUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(recordUsageAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordUsageAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUsage = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(recordUsageAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(subscribeToNewPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeToNewPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUsage = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(subscribeToNewPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      });
  },
});

export const { resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;