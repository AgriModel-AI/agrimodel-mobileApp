import { useTheme } from '@/hooks/ThemeProvider';
import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import useRelativeTime from '@/hooks/useRelativeTime';


const PostCard = ({ post, onLikeClick, setSelectedPost }: any) => {

  const { theme } = useTheme();
  const { t } = useTranslation();
  const getRelativeTime = useRelativeTime(); 

  return (
    <TouchableOpacity key={post.postId} onPress={() => setSelectedPost(post)} style={[styles.postCard, {borderBottomColor: theme.colors.inputBackground}]}>
        <View style={styles.userInfo}>
            <Image source={{uri: post.user.profilePicture}} style={styles.userAvatar} />
            <View>
                <Text style={[styles.userName, { color: theme.colors.text }]}>{post.user.names}</Text>
                <Text style={[styles.postTime, { color: theme.colors.text }]}>{getRelativeTime(post.createdAt)}</Text>
            </View>
            </View>

            <Text style={[styles.postDescription, { color: theme.colors.text }]}>{post.content}</Text>
            <Image source={{uri: post.imageUrl}} style={styles.postImage} />

            <View style={styles.postActions}>

            <Pressable onPress={() => onLikeClick(post.postId)} >
                <View style={styles.actionItem}>
                    <MaterialCommunityIcons name="heart-outline" size={20} color={theme.colors.text} />
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>{post.likes} {t('community.likes')}</Text>
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
});
