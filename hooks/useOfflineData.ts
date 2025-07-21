// Step 6: Create a custom hook for easier usage
// hooks/useOfflineData.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/persistConfig';
import { fetchUserDetails } from '../redux/slices/userDetailsSlice';

export const useOfflineData = () => {
  const dispatch = useDispatch<any>();
  const { 
    userDetails, 
    loading, 
    error, 
    hasFetched, 
    lastFetched,
    pendingActions
  } = useSelector((state: RootState) => state.userDetails);
  const { isConnected } = useSelector((state: RootState) => state.network);

  const refreshData = useCallback(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  const hasOfflineData = hasFetched && userDetails !== null;
  const hasPendingChanges = pendingActions.length > 0;
  
  // Calculate data freshness in minutes
  const dataAge = lastFetched 
    ? Math.round((new Date().getTime() - new Date(lastFetched).getTime()) / (1000 * 60))
    : null;

  return {
    data: userDetails,
    isLoading: loading,
    error,
    isOffline: !isConnected,
    hasOfflineData,
    hasPendingChanges,
    pendingActionsCount: pendingActions.length,
    refreshData,
    dataAge,
    lastFetched
  };
};