import { useTheme } from '@/hooks/ThemeProvider';
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Text, TextInput, FlatList, TouchableOpacity, Modal,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ListEmptyComponent from './ListEmptyComponent';
import useRelativeTime from '@/hooks/useRelativeTime';
import { useDispatch, useSelector } from 'react-redux';
import { createComment } from '@/redux/slices/postsSlice';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const PostModal = ({ postId, comments, modalVisible, handleCloseModal }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const getRelativeTime = useRelativeTime();
  const dispatch = useDispatch<any>();
  const [comment, setComment] = useState<string>('');
  const isCreatingComment = useSelector((state: any) => state.posts.creatingComment);
  const [localComments, setLocalComments] = useState(comments);
  const translateY = new Animated.Value(0);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleComment = () => {
    if (comment.trim() === '') return;
    dispatch(createComment({ postId, comment }));
    setComment('');
  };

  const onGestureEvent = Animated.event([{ nativeEvent: { translationY: translateY } }], { useNativeDriver: true });

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 100) {
        handleCloseModal();
      } else {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      }
    }
  };

  return (
    <Modal visible={modalVisible} animationType="fade" onRequestClose={handleCloseModal} transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
        <View style={styles.modalBackground}>
          <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
            <Animated.View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.background, transform: [{ translateY }] }
              ]}
            >
              {/* Header with Close Button */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('community.comments')}</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              <FlatList
                data={localComments}
                keyExtractor={(item) => item.commentId.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={[styles.commentItem, { backgroundColor: theme.colors.inputBackground }]}>
                    <Text style={[styles.commentUserName, { color: theme.colors.text }]}>{item.names}</Text>
                    <Text style={[styles.commentText, { color: theme.colors.text }]}>{item.content}</Text>
                    <Text style={[styles.commentDate, { color: theme.colors.text }]}>{getRelativeTime(item.createdAt)}</Text>
                  </View>
                )}
                ListEmptyComponent={<ListEmptyComponent />}
                contentContainerStyle={styles.commentsList}
                style={styles.commentsContainer}
              />

              {/* Comment Input */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={[styles.commentInput, { color: theme.colors.text }]}
                  placeholder={t('community.inputPlaceholder')}
                  placeholderTextColor="#aaa"
                  value={comment}
                  onChangeText={(text) => setComment(text)}
                />
                <TouchableOpacity disabled={isCreatingComment} onPress={handleComment} style={styles.addCommentButton}>
                  {isCreatingComment ? (
                    <ActivityIndicator size="small" color={theme.colors.text} />
                  ) : (
                    <Text style={styles.addCommentButtonText}>{t('community.post')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PostModal;

const styles = StyleSheet.create({
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalBackground: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '80%',
    elevation: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
  closeButton: { padding: 5 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginRight: 10 },
  addCommentButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  addCommentButtonText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
  commentsContainer: { flex: 1, paddingBottom: 0 },
  commentsList: { paddingBottom: 10 },
  commentItem: { marginBottom: 10, padding: 10, borderRadius: 10 },
  commentUserName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
  commentText: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginBottom: 5 },
  commentDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#aaa' },
});
