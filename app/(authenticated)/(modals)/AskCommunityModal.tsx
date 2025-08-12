import { Community } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
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

interface AskCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  communities: Community[];
  onSubmit: (communityId: number, content: string, imageUri: string | null) => Promise<void>;
  isLoading: boolean;
}

const AskCommunityModal = ({ 
  visible, 
  onClose, 
  communities,
  onSubmit,
  isLoading
}: AskCommunityModalProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation(); // Added useTranslation hook
  const insets = useSafeAreaInsets();
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const joinedCommunities = communities.filter(c => c.joined);
  const contentInputRef = useRef<TextInput>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCommunityId || !content.trim()) return;
    
    try {
      await onSubmit(selectedCommunityId, content, image);
      resetForm();
      onClose();
    } catch (error) {
      // console.error('Error creating post:', error);
    }
  };

  const resetForm = () => {
    setSelectedCommunityId(null);
    setContent('');
    setImage(null);
  };

  const isFormValid = selectedCommunityId !== null && content.trim().length > 0;

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
              {t('community.askCommunity', 'Ask Community')}
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('community.selectCommunity', 'Select Community')}
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.communitiesScroll}
              contentContainerStyle={styles.communitiesContainer}
            >
              {joinedCommunities.length > 0 ? (
                joinedCommunities.map(community => (
                  <TouchableOpacity
                    key={community.communityId}
                    style={[
                      styles.communityChip,
                      { borderColor: theme.colors.border },
                      selectedCommunityId === community.communityId && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary
                      }
                    ]}
                    onPress={() => setSelectedCommunityId(community.communityId)}
                  >
                    <Text
                      style={[
                        styles.communityChipText,
                        { color: selectedCommunityId === community.communityId ? '#fff' : theme.colors.text }
                      ]}
                    >
                      {community.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.noCommunitiesText, { color: theme.colors.placeholder }]}>
                  {t('community.noCommunitiesJoined', "You haven't joined any communities yet.")}
                </Text>
              )}
            </ScrollView>

            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('community.content', 'Content')}
            </Text>
            <TextInput
              ref={contentInputRef}
              value={content}
              onChangeText={setContent}
              placeholder={t('community.contentPlaceholder', 'Share your thoughts, questions, or insights...')}
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
                {t('community.addImage', 'Add Image')}
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
                  {t('community.post', 'Post')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AskCommunityModal;

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
  communitiesScroll: {
    marginBottom: 24,
  },
  communitiesContainer: {
    paddingBottom: 8,
  },
  communityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  communityChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noCommunitiesText: {
    fontSize: 14,
    padding: 8,
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