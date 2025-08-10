// CommentModal.tsx
import { Comment } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCommunity } from '../../../hooks/useCommunity';
import { CommentItem } from './../../../components/community/CommentItem';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
  postAuthor: string;
  comments: Comment[];
}

const CommentModal = ({ 
  visible, 
  onClose, 
  postId, 
  postAuthor,
  comments 
}: CommentModalProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation(); // Added useTranslation hook
  const insets = useSafeAreaInsets();
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addComment, creatingComment } = useCommunity();

  const handleAddComment = async () => {
    setLoading(true);
    if (!newComment.trim()) return;
    
    try {
      await addComment(postId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[
          styles.container, 
          { 
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom
          }
        ]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('community.comments', 'Comments')}
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <Text style={[styles.postAuthor, { color: theme.colors.placeholder }]}>
            {t('community.postBy', 'Post by {{author}}', { author: postAuthor })}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.commentId.toString()}
              renderItem={({ item }) => <CommentItem comment={item} />}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <Text style={[styles.noComments, { color: theme.colors.placeholder }]}>
                  {t('community.noComments', 'No comments yet. Be the first to comment!')}
                </Text>
              }
            />
          )}
          
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder={t('community.addCommentPlaceholder', 'Add a comment...')}
              placeholderTextColor={theme.colors.placeholder}
              style={[styles.input, { color: theme.colors.text }]}
              multiline
            />
            <TouchableOpacity 
              onPress={handleAddComment}
              disabled={creatingComment || !newComment.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: creatingComment || !newComment.trim() ? 0.5 : 1
                }
              ]}
            >
              {creatingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32, // Same width as close button for balance
  },
  postAuthor: {
    fontSize: 14,
    padding: 16,
    paddingTop: 8,
  },
  commentsList: {
    padding: 16,
  },
  noComments: {
    textAlign: 'center',
    fontSize: 16,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});