// src/services/communityService.ts
import { AppDispatch, RootState } from '@/redux/persistConfig';
import { Community } from '@/types/community';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  resetCommunities
} from '../../redux/slices/communitiesSlice';

import { useCallback } from 'react';

export const useCommunityService = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    communities, 
    loading, 
    error, 
    joinLoading, 
    leaveLoading, 
    hasFetched 
  } = useSelector((state: RootState) => state.communities);

  const getCommunities = useCallback(async (): Promise<{ communities: Community[], loading: boolean, error: any }> => {
    if (!hasFetched) {
      await dispatch(fetchCommunities());
    }
    return { communities, loading, error };
  }, [dispatch, hasFetched, communities, loading, error]);

  const join = useCallback(async (communityId: number) => {
    return dispatch(joinCommunity(communityId)).unwrap();
  }, [dispatch]);

  const leave = useCallback(async (communityId: number) => {
    return dispatch(leaveCommunity(communityId)).unwrap();
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetCommunities());
  }, [dispatch]);

  return {
    communities,
    loading,
    error,
    joinLoading,
    leaveLoading,
    hasFetched,
    getCommunities,
    join,
    leave,
    reset
  };
};
