import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

// Async thunk for fetching diseases
export const fetchCrops = createAsyncThunk(
  'crops/fetchCrops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/crop');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Error fetching crops");
    }
  }
);

// Disease slice
const cropSlice = createSlice({
  name: 'crops',
  initialState: {
    crops: [],
    loading: false,
    error: null,
    hasFetched: false, // Tracks if data has been fetched
  },
  reducers: {
    resetcrops(state) {
      state.crops = [];
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    // Handle fetch crops
    builder
      .addCase(fetchCrops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrops.fulfilled, (state, action) => {
        state.loading = false;
        state.crops = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchCrops.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { resetcrops } = cropSlice.actions;
export default cropSlice.reducer;
