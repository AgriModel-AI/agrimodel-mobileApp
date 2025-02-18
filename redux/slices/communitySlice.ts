import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

// Async thunk for fetching user communities
export const fetchCommunities = createAsyncThunk(
  'communities/fetchCommunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/communities/user-community');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Error fetching communities');
    }
  }
);

// Async thunk for joining a community
export const joinCommunity = createAsyncThunk(
  'communities/joinCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/communities/user-community/${communityId}`);
      return communityId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Error joining community');
    }
  }
);

// Async thunk for leaving a community
export const leaveCommunity = createAsyncThunk(
  'communities/leaveCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/communities/user-community/${communityId}`);
      return communityId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Error leaving community');
    }
  }
);

// Community slice
const communitySlice = createSlice({
  name: 'communities',
  initialState: {
    communities: [],
    loading: false,
    error: null,
    joinLoading: false,
    leaveLoading: false,
    hasFetched: false,
  },
  reducers: {
    resetCommunities(state) {
      state.communities = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchCommunities.rejected, (state, action:any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(joinCommunity.pending, (state) => {
        state.joinLoading = true;
        state.error = null;
      })
      .addCase(joinCommunity.fulfilled, (state: any, action) => {
        state.joinLoading = false;
        const community = state.communities.find((c: any) => c.communityId === action.payload);
        if (community) {
          community.joined = true;
        }
      })
      .addCase(joinCommunity.rejected, (state, action:any) => {
        state.joinLoading = false;
        state.error = action.payload;
      })
      .addCase(leaveCommunity.pending, (state) => {
        state.leaveLoading = true;
        state.error = null;
      })
      .addCase(leaveCommunity.fulfilled, (state: any, action) => {
        state.leaveLoading = false;
        const community = state.communities.find((c: any) => c.communityId === action.payload);
        if (community) {
          community.joined = false;
        }
      })
      .addCase(leaveCommunity.rejected, (state, action:any) => {
        state.leaveLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { resetCommunities } = communitySlice.actions;
export default communitySlice.reducer;
