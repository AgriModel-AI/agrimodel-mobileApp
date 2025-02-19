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

export const likeAndUnlike = createAsyncThunk(
    'posts/likeAndUnlike',
    async (postId: number, { rejectWithValue }) => {
      try {
        await axiosInstance.post(`/communities/post/${postId}/like`);
        return postId; // Return postId to identify which post to update
      } catch (error: any) {
        return rejectWithValue(error.response?.data || "Error liking/unliking post");
      }
    }
  );

export const createComment = createAsyncThunk(
'posts/createComment',
async ({ postId, comment }: { postId: number; comment: any }, { rejectWithValue }) => {
    try {
    const response = await axiosInstance.post(`/communities/post/${postId}/comment`, {"content": comment});
    return response.data.data;
    } catch (error: any) {
    return rejectWithValue(error.response?.data || "Error creating comment");
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
    hasFetched: false, 
    likeLoadingStates: {},
    creatingComment: false,
  },
  reducers: {
    resetPosts(state) {
      state.posts = [];
      state.error = null;
      state.hasFetched = false;
      state.likeLoadingStates = {};
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
    
      builder
      .addCase(likeAndUnlike.pending, (state: any, action: any) => {
        state.error = null;
        state.likeLoadingStates[action.meta.arg] = true;
      })
      .addCase(likeAndUnlike.fulfilled, (state: any, action) => {
        const postId = action.payload;
        const post = state.posts.find((p: any) => p.postId === postId);
        
        if (post) {
          // Toggle isLiked and update likes count
          post.isLiked = !post.isLiked;
          post.likes += post.isLiked ? 1 : -1;
        }
        state.likeLoadingStates[postId] = false;
      })
      .addCase(likeAndUnlike.rejected, (state: any, action: any) => {
        state.error = action.payload;
        state.likeLoadingStates[action.meta.arg] = false;
      });

      builder
      .addCase(createComment.pending, (state) => {
        state.creatingComment = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state: any, action: any) => {
        state.creatingComment = false;
        const data = action.payload;
        const post = state.posts.find((p: any) => p.postId === data.postId);
        if (post) {
          if (!post.comments) {
            post.comments = [];
          }
          post.comments.push(data); // Add latest comment to the top
        }
      })
      .addCase(createComment.rejected, (state, action: any) => {
        state.creatingComment = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { resetPosts } = postSlice.actions;
export default postSlice.reducer;
