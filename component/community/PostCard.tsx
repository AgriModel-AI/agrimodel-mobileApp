import { useTheme } from '@/hooks/ThemeProvider';
import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import useRelativeTime from '@/hooks/useRelativeTime';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost, likeAndUnlike } from '@/redux/slices/postsSlice';
import Animated, { withSpring, useAnimatedStyle, useSharedValue, withSequence } from 'react-native-reanimated';

const AnimatedMaterialCommunityIcons = Animated.createAnimatedComponent(MaterialCommunityIcons);



const PostCard = ({ post, setSelectedPost, isOwner = false }: any) => {

  const { theme } = useTheme();
  const { t } = useTranslation();
  const getRelativeTime = useRelativeTime(); 
  const dispatch = useDispatch<any>();
  
  const scale = useSharedValue(1);
  
  // Get loading state for this post's like action
  const isLikeLoading = useSelector((state: any) => 
    state.posts.likeLoadingStates[post.postId]
  );

  const isDeleteLoading = useSelector((state: any) => 
    state.posts.deleteLoadingStates[post.postId]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handleLike = (postId: number) => {
    // Trigger animation
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    
    dispatch(likeAndUnlike(postId));
  };

  const renderLikeButton = () => {
    if (isLikeLoading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={post.isLiked ? "red" : theme.colors.text} 
        />
      );
    }
  
    return (
      <AnimatedMaterialCommunityIcons
        style={animatedStyle}
        name={post.isLiked ? "heart" : "heart-outline"}
        size={20}
        color={post.isLiked ? "red" : theme.colors.text}
      />
    );
  };

  const renderDeleteButton = () => {
    if (isDeleteLoading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={post.isLiked ? "red" : theme.colors.text} 
        />
      );
    }

    return (
      <AnimatedMaterialCommunityIcons
        style={animatedStyle}
        name="delete"
        size={20}
        color="red"
      />
    );
  };

  const handleRemovePost = (postId: number) => {
      Alert.alert(
        t('community.deleteConfirm'),
        t('community.deleteDescription'),
        [
          { text: t('community.cancel'), style: "cancel" },
          { text: t('community.delete'), onPress: () => dispatch(deletePost(postId)), style: "destructive" }
        ]
      );
    };

  return (
    <TouchableOpacity key={post.postId} onPress={() => setSelectedPost(post)} style={[styles.postCard, {borderBottomColor: theme.colors.inputBackground}]}>
        <View style={styles.userInfo}>
          <Image source={{uri: post.user.profilePicture}} style={styles.userAvatar} />
          <View>
              <Text style={[styles.userName, { color: theme.colors.text }]}>{post.user.names}</Text>
              <Text style={[styles.postTime, { color: theme.colors.text }]}>{getRelativeTime(post.createdAt)}</Text>
          </View>

          {
            isOwner &&
            (
              <TouchableOpacity onPress={() => handleRemovePost(post.postId)} style={styles.removeButton}>
                {
                  renderDeleteButton()
                }
              </TouchableOpacity>
            )
          }
        </View>

            <Text style={[styles.postDescription, { color: theme.colors.text }]}>{post.content}</Text>
            <Image source={{uri: post.imageUrl}} style={styles.postImage} />

            <View style={styles.postActions}>

            <Pressable 
                onPress={() => handleLike(post.postId)}
                disabled={isLikeLoading}
                style={({ pressed }) => [
                    styles.actionItem,
                    pressed && styles.actionPressed
                ]}
                >
                <View style={styles.actionItem}>
                    {renderLikeButton()}
                    <Text style={[
                    styles.actionText, 
                    { color: post.isLiked ? "red" : theme.colors.text }
                    ]}>
                    {post.likes} {t('community.likes')}
                    </Text>
                </View>
            </Pressable>

            <View style={styles.actionItem}>
                <MaterialCommunityIcons name="comment-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.actionText, { color: theme.colors.text }]}>{post.comments.length} {t('community.comments')}</Text>
            </View>
        </View>
    </TouchableOpacity>
  );
};

export default PostCard;



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
  actionPressed: {
    opacity: 0.7,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 10,
    padding: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 20,
  },

});
