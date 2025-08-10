import axiosInstance from '@/utils/axiosInstance';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


export const createPredict = createAsyncThunk<any, FormData, { rejectValue: string }>(
  'predict/createPredict',
  async (predictData, { rejectWithValue }) => {
    try {

      const response = await axiosInstance.post('/predict', predictData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data)
      return response.data;
    } catch (error:any) {
      console.log(error.response?.data)
      return rejectWithValue(error.response?.data || "Error creating prediction");
    }
  }
);

export const fetchDiagnosisResults = createAsyncThunk(
  'predict/fetchDiagnosisResults',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/diagnosis-result/user`);
      // console.log(response.data.data)
      return response.data.data;
    } catch (error: any) {
      console.log(error.response?.data);
      return rejectWithValue(error.response?.data || "Error fetching diagnosis results");
    }
  }
);


interface RatingData {
  resultId: number | string;
  rating: number;
  feedback?: string;
  diagnosisCorrect?: boolean | null;
}

export const rateDiagnosis = createAsyncThunk<any, RatingData, { rejectValue: string }>(
  'predict/rateDiagnosis',
  async (ratingData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('/models/ratings', ratingData);
      return response.data;
    } catch (error: any) {
      console.log(error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Error submitting rating");
    }
  }
);




// Post slice
const predictSlice = createSlice({
  name: 'predict',
  initialState: {
    data: null,
    results: [],
    loading: false,
    error: null,
    localImage: null,
    hasFetched: false,
    ratingError: null,
    ratingLoading: false
  },
  reducers: {
    setLocalImage(state, action) {
      state.localImage = action.payload;
    },
  },
  extraReducers: (builder) => {

    // Handle create post
    builder
      .addCase(createPredict.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPredict.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.data = action.payload;
        state.hasFetched = false;
      })
      .addCase(createPredict.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDiagnosisResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiagnosisResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchDiagnosisResults.rejected, (state, action) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(rateDiagnosis.pending, (state) => {
        state.ratingLoading = true;
        state.ratingError = null;
      })
      .addCase(rateDiagnosis.fulfilled, (state, action) => {
        state.ratingLoading = false;
        
        // Optimistically update the local state to show rating was successful
        // Find the result that was rated and mark it as rated
        const resultId = action.meta.arg.resultId;
        const result: any = state.results.find((r: any) => r.resultId === resultId);
        if (result) {
          result.rated = true;
        }
      })
      .addCase(rateDiagnosis.rejected, (state, action) => {
        state.ratingLoading = false;
        state.ratingError = null;
      });
  },
});

// Export actions and reducer
export const { setLocalImage } = predictSlice.actions;
export default predictSlice.reducer;