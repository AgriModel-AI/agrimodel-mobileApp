import { usePostService } from '@/services/api/postService';
import { Community, Post } from '@/types/community';
import { useCommunityService } from '../services/api/communityService';

export interface UseCommunityReturn {
  // Community data
  communities: Community[];
  communityLoading: boolean;
  communityError: any;
  joinLoading: boolean;
  leaveLoading: boolean;
  communityHasFetched: boolean;

  // Community functions
  getCommunities: () => void;
  join: (id: number) => Promise<any>;
  leave: (id: number) => Promise<any>;
  resetCommunities: () => void;

  // Post data
  posts: Post[];
  postLoading: boolean;
  postError: any;
  postHasFetched: boolean;
  likeLoadingStates: Record<number, boolean>;
  creatingComment: boolean;
  deleteLoadingStates: Record<number, boolean>;

  // Post functions
  getPosts: () => void;
  addPost: (communityId: number, postData: FormData) => Promise<any>;
  editPost: (postId: number, postData: FormData) => Promise<any>;
  likePost: (postId: number) => Promise<any>;
  removePost: (postId: number) => Promise<any>;
  addComment: (postId: number, comment: string) => Promise<any>;
  resetPosts: () => void;

  // Combined utilities
  getPostsByCommunityId: (communityId: number) => Post[];
  getCommunityById: (communityId: number) => Community | undefined;
  resetAll: () => void;
}

export const useCommunity = (): UseCommunityReturn => {
  const {
    communities,
    loading: communityLoading,
    error: communityError,
    joinLoading,
    leaveLoading,
    hasFetched: communityHasFetched,
    getCommunities,
    join,
    leave,
    reset: resetCommunities
  } = useCommunityService();

  const {
    posts,
    loading: postLoading,
    error: postError,
    hasFetched: postHasFetched,
    likeLoadingStates,
    creatingComment,
    deleteLoadingStates,
    getPosts,
    addPost,
    editPost,
    likePost,
    removePost,
    addComment,
    reset: resetPosts
  } = usePostService();


  const getPostsByCommunityId = (communityId: number): Post[] => {
    return posts.filter((post: any) => post.communityId === communityId);
  };

  // Get a specific community by ID
  const getCommunityById = (communityId: number): Community | undefined => {
    return communities.find((community: any) => community.communityId === communityId);
  };

  const resetAll = () => {
    resetCommunities();
    resetPosts();
  };

  return {
    // Community data
    communities,
    communityLoading,
    communityError,
    joinLoading,
    leaveLoading,
    communityHasFetched,
    
    // Community functions
    getCommunities,
    join,
    leave,
    resetCommunities,
    
    // Post data
    posts,
    postLoading,
    postError,
    postHasFetched,
    likeLoadingStates,
    creatingComment,
    deleteLoadingStates,
    
    // Post functions
    getPosts,
    addPost,
    editPost,
    likePost,
    removePost,
    addComment,
    resetPosts,
    
    // Combined functions
    getPostsByCommunityId,
    getCommunityById,
    resetAll
  };
};