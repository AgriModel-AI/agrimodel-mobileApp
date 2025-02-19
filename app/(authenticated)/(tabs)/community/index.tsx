import Header from '@/component/community/header';
import { useTheme } from '@/hooks/ThemeProvider';
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useCommunity } from '@/contexts/CommunityContext';
import { router } from 'expo-router';
import PostCard from '@/component/community/PostCard';
import PostModal from '@/component/community/PostModal';
import { useTranslation } from 'react-i18next';


interface Post {
  id: number;
  userName: string;
  time: string;
  description: string;
  image: string;
  likes: number;
  comments: number;
}





const Community = () => {
  const { theme } = useTheme();
  const { scrollY, searchIconClicked } = useCommunity();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const { t } = useTranslation();
  


  const handleOpenModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setModalVisible(false);
  };
  

  const posts = Array.from({ length: 5 }).map((_, index) => ({
    id: index,
    userName: 'Uwambaje Eddy',
    time: '1 hour',
    description:
      'Lorem ipsum dolor sit amet consectetur. Volutpat a vitae pellentesque neque ultricies vulputate. Neque vel nibh laoreet rhoncus netus orci. Phasellus feugiat mauris amet.',
    image: require('@/assets/images/landing.jpg'),
    likes: 120,
    comments: 120,
  }));

  return (
    <View style={styles.container}>
      <Header />

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
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLikeClick={() => {}} setSelectedPost={handleOpenModal} />
        ))}
      </Animated.ScrollView>

      {/* Fixed "Ask Community" Button */}
      <TouchableOpacity style={styles.askCommunityButton} onPress={() => router.push('/(authenticated)/(modals)/community')}>
        <Text style={styles.askCommunityButtonText}>{t('community.askCommunity')}</Text>
      </TouchableOpacity>

      {
        selectedPost &&
          <PostModal visible={modalVisible} selectedPost={selectedPost} handleCloseModal={handleCloseModal} />
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
