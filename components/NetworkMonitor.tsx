// Step 4: Network Connectivity Monitoring Component
// components/NetworkMonitor.tsx
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/persistConfig';
import { setNetworkStatus } from '../redux/slices/networkSlice';
import { processPendingActions } from '../redux/slices/userDetailsSlice';

export const NetworkMonitor: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { isConnected } = useSelector((state: RootState) => state.network);
  const { pendingActions } = useSelector((state: RootState) => state.userDetails);

  useEffect(() => {
    // Subscribe to network info updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const currentlyConnected = state.isConnected ?? false;
      
      // Only dispatch if status changed
      if (currentlyConnected !== isConnected) {
        dispatch(setNetworkStatus(currentlyConnected));
        
        // If we're back online and have pending actions, process them
        if (currentlyConnected && pendingActions.length > 0) {
          dispatch(processPendingActions());
        }
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      dispatch(setNetworkStatus(state.isConnected ?? false));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, isConnected, pendingActions.length]);

  // This is a monitoring component that doesn't render anything
  return null;
};