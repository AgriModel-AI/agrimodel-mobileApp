// redux/store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
// import appReducer from './slices/appSlice';
// import authReducer from './slices/authSlice';
// import communityReducer from './slices/communitySlice';
// import diagnosisReducer from './slices/diagnosisSlice';
// import networkReducer from './slices/networkSlice';
// import offlineReducer from './slices/offlineSlice';

// // Define your middleware
// import { authMiddleware } from './middleware/authMiddleware';
// import { offlineMiddleware } from './middleware/offlineMiddleware';
// import { syncMiddleware } from './middleware/syncMiddleware';

// Configure redux-persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['app', 'auth', 'offline', 'diagnosis'], // Only persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
  // app: appReducer,
  // auth: authReducer,
  // network: networkReducer,
  // offline: offlineReducer,
  // diagnosis: diagnosisReducer,
  // community: communityReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       // Ignore these action types
  //       ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
  //       // Ignore these field paths in state
  //       ignoredPaths: ['offline.actions'],
  //     },
  //   }).concat([offlineMiddleware, syncMiddleware, authMiddleware]),
});

// Create persistor
export const persistor = persistStore(store);

// Define types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;