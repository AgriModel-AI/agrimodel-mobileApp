// src/services/postService.ts
import { AppDispatch, RootState } from '@/redux/persistConfig';
import {
    createComment,
    createPost,
    deletePost,
    fetchPosts,
    likeAndUnlike,
    resetPosts,
    updatePost
} from '@/redux/slices/postsSlice';
import { Post } from '@/types/community';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const usePostService = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    posts, 
    loading, 
    error, 
    hasFetched, 
    likeLoadingStates, 
    creatingComment, 
    deleteLoadingStates 
  } = useSelector((state: RootState) => state.posts);

  const getPosts = useCallback(async (): Promise<{ posts: Post[], loading: boolean, error: any }> => {
    if (!hasFetched) {
      await dispatch(fetchPosts());
    }
    return { posts, loading, error };
  }, [dispatch, hasFetched, posts, loading, error]);

  const addPost = useCallback(async (communityId: number, postData: FormData) => {
    return dispatch(createPost({ communityId, postData }));
  }, [dispatch]);

const editPost = useCallback(async (postId: number, postData: FormData) => {
    // console.log('postId', postId);
    // console.log('postData', postData);
    return dispatch(updatePost({ postId, postData }));
}, [dispatch]);
    
  const likePost = useCallback(async (postId: number) => {
    return dispatch(likeAndUnlike(postId));
  }, [dispatch]);

  const removePost = useCallback(async (postId: number) => {
    return dispatch(deletePost(postId));
  }, [dispatch]);

  const addComment = useCallback(async (postId: number, comment: string) => {
    return dispatch(createComment({ postId, comment }));
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetPosts());
  }, [dispatch]);

  return {
    posts,
    loading,
    error,
    hasFetched,
    likeLoadingStates,
    creatingComment,
    deleteLoadingStates,
    getPosts,
    addPost,
    editPost,
    likePost,
    removePost,
    addComment,
    reset
  };
};
