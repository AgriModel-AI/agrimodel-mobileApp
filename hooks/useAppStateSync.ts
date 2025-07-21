// hooks/useAppStateSync.ts
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetworkService from '../services/NetworkService';
import SyncService from '../services/storage/SyncService';

export const useAppStateSync = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && NetworkService.isNetworkConnected()) {
        SyncService.performSync().catch(console.error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled]);
};
