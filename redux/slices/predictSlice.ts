import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';


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

// Post slice
const predictSlice = createSlice({
  name: 'predict',
  initialState: {
    data: null,
    loading: false,
    error: null,
    localImage: '',
  },
  reducers: {
    setLocalImage(state, action) {
      console.log("Updating")
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
      })
      .addCase(createPredict.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { setLocalImage } = predictSlice.actions;
export default predictSlice.reducer;