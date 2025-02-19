import Header from '@/component/community/header';
import { useTheme } from '@/hooks/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useCommunity } from '@/contexts/CommunityContext';
import { router } from 'expo-router';
import PostCard from '@/component/community/PostCard';
import PostModal from '@/component/community/PostModal';
import { useTranslation } from 'react-i18next';
import PostCardSkeleton from '@/component/PostCardSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '@/redux/slices/postsSlice';
import EmptyPostsState from '@/component/community/EmptyPostsState';

const defaultCommunity = {
  "communityId": 0,
  "name": "All"
};

const Community = () => {
  const { theme } = useTheme();
  const { scrollY, searchIconClicked } = useCommunity();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(defaultCommunity);
  const [filteredPosts, setFilteredPosts] = useState<any>([]);
  
  
  const { t } = useTranslation();

  const dispatch = useDispatch<any>();

  const { posts, loading , hasFetched} = useSelector((state: any) => state.posts);
  const { communities } = useSelector((state: any) => state.communites);
  const [search, setSearch] = useState<any>('');

  const handleSearch = (content: any) => {
    setSearch(content);
  }

  useEffect(() => {
    // Filter posts based on selected community and search term
    const filterPosts = () => {
      let filtered = [...posts];
  
      // Filter by community if not default (communityId !== 0)
      if (selectedCommunity.communityId !== 0) {
        filtered = filtered.filter(post => post.communityId === selectedCommunity.communityId);
      }
  
      // Filter by search term if it exists
      if (search && search.trim()) {
        const searchTerm = search.toLowerCase().trim();
        filtered = filtered.filter(post => 
          post.user.names.toLowerCase().includes(searchTerm) || 
          post.content.toLowerCase().includes(searchTerm)
        );
      }
  
      setFilteredPosts(filtered);
    };
  
    filterPosts();
  }, [posts, selectedCommunity, search]);


  useEffect(() => {
      if (!hasFetched) {
        dispatch(fetchPosts());
      }
    }, [hasFetched, dispatch]);

    useEffect(()=>{
      if(hasFetched) {
        dispatch(fetchPosts());
      }
    }, [communities]);

  const handleOpenModal = (post: any) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header selectedCommunity={selectedCommunity} setSelectedCommunity={setSelectedCommunity} handleSearch={handleSearch}/>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background, paddingBottom: 20 }]}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
          if (scrollY.value > 100 && searchIconClicked.value) {
            searchIconClicked.value = false;
          }
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 170 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Render Post Cards */}
        {loading ? (
          <PostCardSkeleton count={2}/>
        ) : filteredPosts.length === 0 ? (
          <EmptyPostsState />
        ) : (
          filteredPosts.map((post: any) => (
            <PostCard 
              key={post.postId} 
              post={post}
              setSelectedPost={handleOpenModal} 
            />
          ))
        )}
      </Animated.ScrollView>

      {/* Fixed "Ask Community" Button */}
      <TouchableOpacity style={styles.askCommunityButton} onPress={() => router.push('/(authenticated)/(modals)/community')}>
        <Text style={styles.askCommunityButtonText}>{t('community.askCommunity')}</Text>
      </TouchableOpacity>

      {
        selectedPost &&
          <PostModal visible={modalVisible} comments={selectedPost.comments} handleCloseModal={handleCloseModal} />
      }
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  askCommunityButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
  },
  askCommunityButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  
});

export default Community;
