// Step 1: Configure Redux Persist
// store/persistConfig.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import communitiesReducer from './slices/communitiesSlice';
import exploreReducer from './slices/exploreSlice';
import networkReducer from './slices/networkSlice';
import notificationsReducer from './slices/notificationSlice';
import postsReducer from './slices/postsSlice';
import predictReducer from './slices/predictSlice';
import userDetailsReducer from './slices/userDetailsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['userDetails'], // Only persist userDetails slice
};

const rootReducer = combineReducers({
  userDetails: userDetailsReducer,
  network: networkReducer,
  communities: communitiesReducer,
  posts: postsReducer,
  explore: exploreReducer,
  notifications: notificationsReducer,
  predict: predictReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types as they might contain non-serializable values
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;