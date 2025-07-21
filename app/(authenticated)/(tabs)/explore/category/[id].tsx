import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { RootState } from '../../../../../redux/persistConfig';

const { width, height } = Dimensions.get('window');

export default function ExploreDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { items, loading } = useSelector((state: RootState) => state.explore);
  const item = items.find((item: any) => item.id === Number(id));

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const showImageModal = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  if (loading && !item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="light" />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={50} color={theme.colors.danger} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {t('explore.itemNotFoundMessage')}
          </Text>
          <TouchableOpacity
            style={[styles.readMoreButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.readMoreText}>{t('explore.backToExplore')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(item.date).toLocaleDateString();
  const otherImagesList = item.otherImages ? item.otherImages.split(',') : [];

  const handleReadMore = () => {
    if (item?.link) {
      router.push({
        pathname: '/(authenticated)/(modals)/webview',
        params: { url: item.link, title: item.title },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />

      {/* Full-bleed Main Image */}
      <Image source={{ uri: item.image }} style={styles.headerImage} />

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Animated.ScrollView
        entering={FadeInUp.duration(500)}
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 55}]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.meta}>
          <Text style={[styles.type, { color: theme.colors.primary }]}>{item.type}</Text>
          <Text style={[styles.date, { color: theme.colors.accent }]}>{formattedDate}</Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>

        <Text style={[styles.body, { color: theme.colors.text }]}>{item.content}</Text>

        {item.link ? (
          <TouchableOpacity
            style={[styles.readMoreButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleReadMore}
          >
            <Text style={styles.readMoreText}>{t('explore.readMore')}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Other Images Gallery */}
        {otherImagesList.length > 0 && (
          <View style={styles.gallery}>
            <Text style={[styles.galleryTitle, { color: theme.colors.text }]}>
              {t('explore.moreImages')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {otherImagesList.map((uri, idx) => (
                <TouchableOpacity key={idx} onPress={() => showImageModal(uri)}>
                  <Image
                    source={{ uri }}
                    style={styles.galleryImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.ScrollView>

      {/* Modal for Fullscreen Image */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImage: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  type: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  readMoreButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  readMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gallery: {
    marginTop: 10,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  galleryImage: {
    width: 120,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height * 0.8,
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 24,
  },
});
