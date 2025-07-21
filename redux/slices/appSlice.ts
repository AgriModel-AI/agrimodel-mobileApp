// redux/slices/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'fr' | 'rw';

interface AppState {
  themeMode: ThemeMode;
  language: Language;
  isFirstTime: boolean;
  lastSyncTimestamp: number | null;
}

const initialState: AppState = {
  themeMode: 'system',
  language: 'en',
  isFirstTime: true,
  lastSyncTimestamp: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setFirstTimeCompleted: (state) => {
      state.isFirstTime = false;
    },
    updateSyncTimestamp: (state) => {
      state.lastSyncTimestamp = Date.now();
    },
  },
});

export const { setThemeMode, setLanguage, setFirstTimeCompleted, updateSyncTimestamp } = appSlice.actions;
export default appSlice.reducer;