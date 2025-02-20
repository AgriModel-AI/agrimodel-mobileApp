import { useTheme } from '@/hooks/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import HeaderPost from '@/component/community/HeaderPost';
import { useCommunity } from '@/contexts/CommunityContext';
import { useRouter } from 'expo-router';
import PostCard from '@/component/community/PostCard';
import PostModal from '@/component/community/PostModal';
import { useTranslation } from 'react-i18next';
import PostCardSkeleton from '@/component/PostCardSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '@/redux/slices/postsSlice';
import EmptyPostsState from '@/component/community/EmptyPostsState';


const Community = () => {
  
  
  const router = useRouter();
  const { userDetails } = useSelector((state: any) => state.userDetails);
  
  const { theme } = useTheme();
  const { scrollY, searchIconClicked } = useCommunity();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [filteredPosts, setFilteredPosts] = useState<any>([]);
  
  
  const { t } = useTranslation();

  const dispatch = useDispatch<any>();

  const { posts, loading , hasFetched} = useSelector((state: any) => state.posts);
  const { communities } = useSelector((state: any) => state.communites);


  useEffect(() => {
    // Filter posts based on selected community and search term
    const filterPosts = () => {
      let filtered = [...posts];

      filtered = filtered.filter((post)=> post.user.userId === userDetails?.userId).sort((a, b) => b.postId - a.postId);
  
      setFilteredPosts(filtered);
    };
  
    filterPosts();
  }, [posts]);

  useEffect(()=> {
    if(selectedPost) {
      setSelectedPost(posts.find((post: any) => post.postId === selectedPost.postId))
    }
  }, [posts])


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
      <HeaderPost />

      <Animated.ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background, paddingBottom: 20 }]}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
          if (scrollY.value > 100 && searchIconClicked.value) {
            searchIconClicked.value = false;
          }
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 90 }}
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
              isOwner={true}
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
          <PostModal postId={selectedPost.postId} visible={modalVisible} comments={selectedPost.comments} handleCloseModal={handleCloseModal} />
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
