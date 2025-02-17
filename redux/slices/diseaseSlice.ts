import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

// Async thunk for fetching diseases
export const fetchDiseases = createAsyncThunk(
  'diseases/fetchDiseases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/disease');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Error fetching diseases");
    }
  }
);

// Disease slice
const diseaseSlice = createSlice({
  name: 'diseases',
  initialState: {
    diseases: [],
    loading: false,
    error: null,
    hasFetched: false, // Tracks if data has been fetched
  },
  reducers: {
    resetDiseases(state) {
      state.diseases = [];
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    // Handle fetch diseases
    builder
      .addCase(fetchDiseases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiseases.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchDiseases.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { resetDiseases } = diseaseSlice.actions;
export default diseaseSlice.reducer;
