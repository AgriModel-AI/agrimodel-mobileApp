import { useTheme } from '@/hooks/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ListEmptyComponent from './ListEmptyComponent';
import useRelativeTime from '@/hooks/useRelativeTime';
import { useDispatch, useSelector } from 'react-redux';
import { createComment } from '@/redux/slices/postsSlice';

const PostModal = ({ postId, comments, modalVisible, handleCloseModal }: any) => {

  const { theme } = useTheme();
  const { t } = useTranslation();
  const getRelativeTime = useRelativeTime(); 
  const dispatch = useDispatch<any>();
  const [comment, setComment] = useState<any>();

  const isCreatingComment = useSelector((state: any) => 
    state.posts.creatingComment
  );

  const [localComments, setLocalComments] = useState(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  

  const handleComment = () => {
    if(comment === ''){
      return;
    }
    dispatch(createComment({postId, "comment": comment}));
    setComment('');

  }

  useEffect(()=> {
    console.log(comments)
  }, [comments])



  return (
    <Modal visible={modalVisible} animationType="fade" onRequestClose={handleCloseModal} transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
            <View style={[styles.modalBackground]}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    {/* Close Button */}
                    <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('community.comments')}</Text>
                      <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                          <MaterialCommunityIcons name="close" size={24} color={ theme.colors.text } />
                      </TouchableOpacity>
                    </View>
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
                        contentContainerStyle={styles.commentsList}  // Adjust the content container style
                        style={styles.commentsContainer}  // Adjust the FlatList styling
                    />
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={[styles.commentInput, {color: theme.colors.text}]}
                            placeholder={t('community.inputPlaceholder')}
                            placeholderTextColor="#aaa"
                            value={comment}
                            onChangeText={(text)=> setComment(text)}
                        />
                        <TouchableOpacity disabled={isCreatingComment} onPress={handleComment} style={styles.addCommentButton}>
                            
                            {
                              isCreatingComment ?
                              <ActivityIndicator 
                                size="small" 
                                color={theme.colors.text} 
                              />
                              :
                              <Text style={styles.addCommentButtonText}>{t('community.post')}</Text>
                            }
                                    
                        </TouchableOpacity>
                    </View>                
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
  );
};

export default PostModal;



const styles = StyleSheet.create({
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
    marginBottom: 20,
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
