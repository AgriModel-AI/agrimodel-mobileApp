import Header from '@/component/community/header';
import { useTheme } from '@/hooks/ThemeProvider';
import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCommunity } from '@/contexts/CommunityContext';
import HeaderPost from '@/component/community/HeaderPost';


interface Post {
  id: number;
  userName: string;
  time: string;
  description: string;
  image: string;
  likes: number;
  comments: number;
}

interface Comment {
  id: number;
  text: string;
  userName: string;
  date: string;
}

const commentsData: Comment[] = [
  {
    id: 1,
    text: "This is a great post! Really enjoyed reading it.",
    userName: "John Doe",
    date: "2025-01-07 10:30 AM",
  },
  {
    id: 2,
    text: "I agree! The description is spot on. Keep it up!",
    userName: "Jane Smith",
    date: "2025-01-07 11:00 AM",
  },
  {
    id: 3,
    text: "This post is very insightful, I learned a lot. Thanks for sharing!",
    userName: "Alice Johnson",
    date: "2025-01-07 12:15 PM",
  },
  {
    id: 4,
    text: "I had a similar experience, nice to see it discussed here.",
    userName: "Bob Williams",
    date: "2025-01-07 1:45 PM",
  },
  {
    id: 5,
    text: "Great post! Would love to see more content like this.",
    userName: "Charlie Brown",
    date: "2025-01-07 2:30 PM",
  },
  {
    id: 6,
    text: "Great post! Would love to see more content like this.",
    userName: "Charlie Brown",
    date: "2025-01-07 2:30 PM",
  },
  {
    id: 7,
    text: "Great post! Would love to see more content like this.",
    userName: "Charlie Brown",
    date: "2025-01-07 2:30 PM",
  },{
    id: 8,
    text: "Great post! Would love to see more content like this.",
    userName: "Charlie Brown",
    date: "2025-01-07 2:30 PM",
  },{
    id: 9,
    text: "Great post! Would love to see more content like this.",
    userName: "Charlie Brown",
    date: "2025-01-07 2:30 PM",
  }];

  const postsData = Array.from({ length: 5 }).map((_, index) => ({
    id: index,
    userName: 'Uwambaje Eddy',
    time: '1 hour',
    description:
      'Lorem ipsum dolor sit amet consectetur. Volutpat a vitae pellentesque neque ultricies vulputate. Neque vel nibh laoreet rhoncus netus orci. Phasellus feugiat mauris amet.',
    image: 'https://via.placeholder.com/100',
    likes: 120,
    comments: 120,
  }));

const Community = () => {
  const { theme } = useTheme();
  const { scrollY, searchIconClicked } = useCommunity();
  const [posts, setPosts] = useState<Post[]>(postsData);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(commentsData);

  const handleRemovePost = (postId: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => removePost(postId), style: "destructive" }
      ]
    );
  };

  const removePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleOpenModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };


  return (
    <View style={styles.container}>
      <HeaderPost />

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
        contentContainerStyle={{ paddingTop: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Render Post Cards */}
        {posts.map((post) => (
          <TouchableOpacity key={post.id} onPress={() => handleOpenModal(post)} style={[styles.postCard, {borderBottomColor: theme.colors.inputBackground}]}>
            <View style={styles.userInfo}>
              <Image source={{ uri: post.image }} style={styles.userAvatar} />
              <View>
                <Text style={[styles.userName, { color: theme.colors.text }]}>{post.userName}</Text>
                <Text style={[styles.postTime, { color: theme.colors.text }]}>{post.time}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemovePost(post.id)} style={styles.removeButton}>
                <MaterialCommunityIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
            </View>

            <Text style={[styles.postDescription, { color: theme.colors.text }]}>{post.description}</Text>
            <Image source={{ uri: post.image }} style={styles.postImage} />

            <View style={styles.postActions}>
              <View style={styles.actionItem}>
                <MaterialCommunityIcons name="heart-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.actionText, { color: theme.colors.text }]}>{post.likes} likes</Text>
              </View>
              <View style={styles.actionItem}>
                <MaterialCommunityIcons name="comment-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.actionText, { color: theme.colors.text }]}>{post.comments} comments</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* Fixed "Ask Community" Button */}
      <TouchableOpacity style={styles.askCommunityButton}>
        <Text style={styles.askCommunityButtonText}>Ask Community</Text>
      </TouchableOpacity>

      {/* Modal for Comments */}
      {selectedPost && (
        <Modal visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)} transparent>
          
            <View style={[styles.modalBackground]}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                  {/* Close Button */}
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Comments</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                      <MaterialCommunityIcons name="close" size={24} color={ theme.colors.text } />
                    </TouchableOpacity>
                  </View>
                  {/* Use FlatList instead of ScrollView */}
                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={[styles.commentItem, { backgroundColor: theme.colors.inputBackground }]}>
                        <Text style={[styles.commentUserName, { color: theme.colors.text }]}>{item.userName}</Text>
                        <Text style={[styles.commentText, { color: theme.colors.text }]}>{item.text}</Text>
                        <Text style={[styles.commentDate, { color: theme.colors.text }]}>{item.date}</Text>
                      </View>
                    )}
                    ListEmptyComponent={<Text style={styles.noComments}>No comments yet</Text>}
                    contentContainerStyle={styles.commentsList}  // Adjust the content container style
                    style={styles.commentsContainer}  // Adjust the FlatList styling
                  />
      
                
                </View>
            </View>
      </Modal>
      
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postCard: {
    borderBottomWidth: 1.5,
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  postTime: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  postDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 10,
    padding: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 20,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 5,
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
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  closeButton: {
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: 150,  // Reduced height
    borderRadius: 10,
    marginBottom: 10,
  },
  
  modalDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 10,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalStat: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  addCommentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addCommentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  noComments: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 10,
    marginTop: 20,
  },
  
  commentItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  
  commentUserName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  
  commentText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 5,
  },
  
  commentDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#aaa',
  },
  commentsContainer: {
    flex: 1,
    paddingBottom: 0,
  },
  commentsList: { paddingBottom: 10, },
});

export default Community;
