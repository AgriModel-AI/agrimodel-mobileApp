// redux/slices/offlineSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum OfflineActionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  FAILED = 'failed',
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  status: OfflineActionStatus;
  timestamp: number;
  retryCount: number;
  error?: string;
}

interface OfflineState {
  actions: OfflineAction[];
  isSyncing: boolean;
  lastSyncAttempt: number | null;
  lastSuccessfulSync: number | null;
  syncProgress: number;
}

const initialState: OfflineState = {
  actions: [],
  isSyncing: false,
  lastSyncAttempt: null,
  lastSuccessfulSync: null,
  syncProgress: 0,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    addOfflineAction: (state, action: PayloadAction<Omit<OfflineAction, 'status' | 'timestamp' | 'retryCount'>>) => {
      state.actions.push({
        ...action.payload,
        status: OfflineActionStatus.PENDING,
        timestamp: Date.now(),
        retryCount: 0,
      });
    },
    removeOfflineAction: (state, action: PayloadAction<string>) => {
      state.actions = state.actions.filter(a => a.id !== action.payload);
    },
    updateOfflineActionStatus: (state, action: PayloadAction<{ id: string; status: OfflineActionStatus; error?: string }>) => {
      const { id, status, error } = action.payload;
      const actionIndex = state.actions.findIndex(a => a.id === id);
      
      if (actionIndex !== -1) {
        state.actions[actionIndex].status = status;
        if (error) {
          state.actions[actionIndex].error = error;
        }
        if (status === OfflineActionStatus.FAILED) {
          state.actions[actionIndex].retryCount += 1;
        }
      }
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
      if (action.payload) {
        state.lastSyncAttempt = Date.now();
        state.syncProgress = 0;
      } else if (state.actions.length === 0) {
        state.lastSuccessfulSync = Date.now();
        state.syncProgress = 100;
      }
    },
    updateSyncProgress: (state, action: PayloadAction<number>) => {
      state.syncProgress = action.payload;
    },
    clearCompletedActions: (state) => {
      state.actions = state.actions.filter(a => a.status === OfflineActionStatus.PENDING);
    },
  },
});

export const {
  addOfflineAction,
  removeOfflineAction,
  updateOfflineActionStatus,
  setSyncing,
  updateSyncProgress,
  clearCompletedActions,
} = offlineSlice.actions;

export default offlineSlice.reducer;