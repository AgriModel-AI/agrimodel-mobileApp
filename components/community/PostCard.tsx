import { Post } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import EditPostModal from '../../app/(authenticated)/(modals)/EditPostModal'; // Import the new component
import { useTheme } from '../../contexts/ThemeContext';
import CommentModal from './../../app/(authenticated)/(modals)/CommentModal';

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onDelete?: (postId: number) => void;
  isLikeLoading: boolean;
  isDeleteLoading: boolean;
  currentUserId?: number;
  canEdit?: boolean; // Default value will be false
}

export const PostCard = ({ 
  post, 
  onLike, 
  onDelete, 
  isLikeLoading, 
  isDeleteLoading,
  currentUserId,
  canEdit = false
}: PostCardProps) => {
  const { theme } = useTheme();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const isOwnPost = currentUserId === post.user.userId;
  const formattedDate = format(new Date(post.createdAt), 'MMM d, yyyy');

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={[styles.container, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: post.user.profilePicture || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {post.user.names}
            </Text>
            <Text style={[styles.date, { color: theme.colors.placeholder }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
        
        {isOwnPost && (
          <View style={styles.postActions}>
            {canEdit && (
              <TouchableOpacity 
                onPress={() => setEditModalVisible(true)}
                style={styles.actionIcon}
              >
                <Ionicons name="pencil-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity 
                onPress={() => onDelete(post.postId)}
                disabled={isDeleteLoading}
                style={styles.actionIcon}
              >
                {isDeleteLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      <Text style={[styles.content, { color: theme.colors.text }]}>
        {post.content}
      </Text>
      
      {post.imageUrl && (
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onLike(post.postId)}
          disabled={isLikeLoading}
        >
          {isLikeLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <Ionicons 
                name={post.isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={post.isLiked ? theme.colors.danger : theme.colors.text} 
              />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                {post.likes}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setCommentModalVisible(true)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            {post.comments?.length || 0}
          </Text>
        </TouchableOpacity>
      </View>
      
      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        postId={post.postId}
        postAuthor={post.user.names}
        comments={post.comments || []}
      />
      
      <EditPostModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        post={post}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
  },
});