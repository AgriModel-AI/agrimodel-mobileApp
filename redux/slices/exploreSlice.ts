// store/slices/exploreSlice.ts
import axiosInstance from '@/utils/axiosInstance';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExploreItem {
  id: number;
  type: string;
  title: string;
  content: string;
  image: string;
  otherImages: string;
  link: string;
  date: string;
}

interface ExploreState {
  items: ExploreItem[];
  filteredItems: ExploreItem[];
  activeFilter: string;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: ExploreState = {
  items: [],
  filteredItems: [],
  activeFilter: 'all',
  searchQuery: '',
  loading: false,
  error: null,
};

export const fetchExploreItems = createAsyncThunk(
  'explore/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/explore');
      return response.data;
    } catch (error:any) {
      return rejectWithValue(`Failed to fetch explore items ${error}`);
    }
  }
);

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {
    setActiveFilter: (state, action: PayloadAction<string>) => {
      state.activeFilter = action.payload;
      
      if (action.payload === 'all') {
        state.filteredItems = state.items.filter(item => 
          item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
      } else {
        state.filteredItems = state.items.filter(
          item => 
            item.type === action.payload && 
            (item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
             item.content.toLowerCase().includes(state.searchQuery.toLowerCase()))
        );
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      
      if (state.activeFilter === 'all') {
        state.filteredItems = state.items.filter(item => 
          item.title.toLowerCase().includes(action.payload.toLowerCase()) ||
          item.content.toLowerCase().includes(action.payload.toLowerCase())
        );
      } else {
        state.filteredItems = state.items.filter(
          item => 
            item.type === state.activeFilter && 
            (item.title.toLowerCase().includes(action.payload.toLowerCase()) ||
             item.content.toLowerCase().includes(action.payload.toLowerCase()))
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExploreItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExploreItems.fulfilled, (state, action: PayloadAction<{ data: ExploreItem[] }>) => {
        state.items = action.payload.data;
        state.filteredItems = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchExploreItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveFilter, setSearchQuery } = exploreSlice.actions;
export default exploreSlice.reducer;