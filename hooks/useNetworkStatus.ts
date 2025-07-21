// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetworkService from '../services/NetworkService';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(NetworkService.isNetworkConnected());

  useEffect(() => {
    const unsubscribe = NetworkService.addListener((connected) => {
      setIsConnected(connected);
    });
    
    return unsubscribe;
  }, []);

  return { isConnected };
};