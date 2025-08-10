// EditPostModal.tsx
import { Post } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCommunity } from '../../../hooks/useCommunity';

interface EditPostModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
}

const EditPostModal = ({ 
  visible, 
  onClose, 
  post
}: EditPostModalProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation(); // Added useTranslation hook
  const insets = useSafeAreaInsets();
  const { editPost } = useCommunity();
  
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [newImageSelected, setNewImageSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when post changes or modal opens
  useEffect(() => {
    if (post && visible) {
      setContent(post.content);
      setImage(post.imageUrl || null);
      setNewImageSelected(false);
    }
  }, [post, visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setNewImageSelected(true);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      // Only append image if it's a new one
      if (image && newImageSelected) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('image', {
          uri: image,
          name: filename,
          type,
        } as any);
      } else if (!image && post.imageUrl) {
        // If image was removed, send a flag to remove it
        formData.append('removeImage', 'true');
      }
      await editPost(post.postId, formData);

      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = content.trim().length > 0;

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
              {t('community.editPost', 'Edit Post')}
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('community.content', 'Content')}
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder={t('community.updatePostPlaceholder', 'Update your post content...')}
              placeholderTextColor={theme.colors.placeholder}
              style={[
                styles.contentInput, 
                { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card 
                }
              ]}
              multiline
              numberOfLines={4}
            />

            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.imageButton,
                { borderColor: theme.colors.border }
              ]} 
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>
                {image ? t('community.changeImage', 'Change Image') : t('community.addImage', 'Add Image')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: isFormValid ? theme.colors.primary : theme.colors.disabled
                }
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('community.updatePost', 'Update Post')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditPostModal;

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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contentInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 4,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});