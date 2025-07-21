// app/(authenticated)/my-posts/index.tsx
import { AskCommunityButton } from '@/components/community/AskCommunityButton';
import { useOfflineData } from '@/hooks/useOfflineData';
import { Post } from '@/types/community';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AskCommunityModal from '../../(modals)/AskCommunityModal';
import { AnimatedHeader } from '../../../../components/community/AnimatedHeader';
import { PostCard } from '../../../../components/community/PostCard';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCommunity } from '../../../../hooks/useCommunity';
import { useNetworkStatus } from '../../../../hooks/useNetworkStatus';

export default function MyPostsScreen() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const { data: user, } = useOfflineData();
  
  const { 
    communities,
    posts,
    postLoading,
    communityHasFetched,
    postHasFetched,
    getCommunities,
    getPosts,
    likePost,
    removePost,
    addPost,
    likeLoadingStates,
    deleteLoadingStates
  } = useCommunity();
  
  // Initial data fetch
  useEffect(() => {
    if (isConnected) {
      const loadData = async () => {
        if (!communityHasFetched) {
          await getCommunities();
        }
        if (!postHasFetched) {
          await getPosts();
        }
      };
      
      loadData();
    }
  }, [isConnected, communityHasFetched, postHasFetched, getCommunities, getPosts]);
  

  useEffect(() => {
      if (posts.length) {
        let filteredPostsItems = posts;
  
        if (posts.length && user) {
          filteredPostsItems = posts.filter(post => post.user.userId === user.userId);
        }
  
        // Create a copy before sorting to avoid mutating original array
        filteredPostsItems = [...filteredPostsItems].sort((a, b) => b.postId - a.postId);
  
        setUserPosts(filteredPostsItems);
      } else {
        setUserPosts([]);
      }
    }, [posts, user]);

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
  
  // Loading state
  if (postLoading && !postHasFetched) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <AnimatedHeader
        title={t('community.myPosts')}
        scrollY={scrollY}
      />
      
      <Animated.FlatList
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: 120 + insets.top,
            paddingBottom: insets.bottom + 80,
            flexGrow: userPosts.length ? undefined : 1
          }
        ]}
        data={userPosts}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={likePost}
            onDelete={removePost}
            isLikeLoading={!!likeLoadingStates[item.postId]}
            isDeleteLoading={!!deleteLoadingStates[item.postId]}
            currentUserId={user?.userId}
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            progressViewOffset={120 + insets.top}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {t('community.noPostsYet')}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.placeholder }]}>
              {t('community.createFirstPost')}
            </Text>
          </View>
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
    </SafeAreaView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});