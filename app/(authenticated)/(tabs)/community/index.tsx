// app/(authenticated)/(tabs)/community/index.tsx
import { useOfflineData } from '@/hooks/useOfflineData';
import { Post } from '@/types/community';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AskCommunityModal from '../../(modals)/AskCommunityModal';
import { CommunityHeader } from '../../../..//components/community/CommunityHeader';
import { PostCard } from '../../../..//components/community/PostCard';
import { useNetworkStatus } from '../../../..//hooks/useNetworkStatus';
import { AskCommunityButton } from '../../../../components/community/AskCommunityButton';
import { EmptyState } from '../../../../components/community/EmptyState';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCommunity } from '../../../../hooks/useCommunity';

export default function CommunityScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const { data: user, } = useOfflineData();
  
  const { 
    communities,
    communityLoading,
    posts,
    postLoading,
    communityHasFetched,
    postHasFetched,
    getCommunities,
    getPosts,
    likePost,
    addPost,
    likeLoadingStates,
    deleteLoadingStates
  } = useCommunity();
  
  // Initial data fetch
  useEffect(() => {
    if (isConnected) {
      const loadData = async () => {
        try {
          if (!communityHasFetched) {
            await getCommunities();
          }
          if (!postHasFetched) {
            await getPosts();
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };
      
      loadData();
    }
  }, [communityHasFetched, getCommunities, getPosts, isConnected, postHasFetched]);
  
  // Filter posts when selection changes
  useEffect(() => {
    if (posts.length) {
      let filteredPostsItems = posts;

      if (selectedCommunityId) {
        filteredPostsItems = posts.filter(post => post.communityId === selectedCommunityId);
      }

      // Create a copy before sorting to avoid mutating original array
      filteredPostsItems = [...filteredPostsItems].sort((a, b) => b.postId - a.postId);

      setFilteredPosts(filteredPostsItems);
    } else {
      setFilteredPosts([]);
    }
  }, [posts, selectedCommunityId]);

  
  const onRefresh = async () => {
    if (!isConnected) return;
    
    setRefreshing(true);
    try {
      await getCommunities();
      await getPosts();
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleCreatePost = async (communityId: number, content: string, imageUri: string | null) => {
    if (!isConnected) return;
    
    const formData = new FormData();
    formData.append('content', content);
    
    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }
    
    await addPost(communityId, formData);
  };
  
  const headerHeight = 180;
  
  // Show loader while initially fetching data
  if ((communityLoading || postLoading) && !communityHasFetched && !postHasFetched) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  // Show offline state when not connected
  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <EmptyState type="offline" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <CommunityHeader
        communities={communities}
        selectedCommunityId={selectedCommunityId}
        onSelectCommunity={setSelectedCommunityId}
        scrollY={scrollY}
      />
      
      <Animated.FlatList
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: headerHeight + insets.top + 16,
            paddingBottom: insets.bottom + 80
          }
        ]}
        data={filteredPosts}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={likePost}
            onDelete={undefined}
            isLikeLoading={!!likeLoadingStates[item.postId]}
            isDeleteLoading={!!deleteLoadingStates[item.postId]}
            currentUserId={user?.userId}
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            progressViewOffset={headerHeight + insets.top}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        ListEmptyComponent={
          postHasFetched && !postLoading ? <EmptyState type="no-posts" /> : null
        }
      />
      
      <AskCommunityButton 
        onPress={() => setModalVisible(true)}
        visible={isConnected && communities.some(c => c.joined)}
      />
      
      <AskCommunityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        communities={communities}
        onSubmit={handleCreatePost}
        isLoading={postLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
});