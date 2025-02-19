import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

// Async thunk for fetching posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/communities/posts');
      return response.data.posts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Error fetching posts");
    }
  }
);

// Async thunk for creating a post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/communities/3/post', postData);
      return response.data.data; // Assuming the response contains the created post data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Error creating post");
    }
  }
);

// Post slice
const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    hasFetched: false, // Tracks if data has been fetched
  },
  reducers: {
    resetPosts(state) {
      state.posts = [];
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    // Handle fetch posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchPosts.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle create post
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.posts.push(action.payload); // Add the new post to the list
      })
      .addCase(createPost.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { resetPosts } = postSlice.actions;
export default postSlice.reducer;
