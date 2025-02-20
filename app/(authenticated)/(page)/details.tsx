import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { 
  FadeIn,
  FadeInDown,
  FadeInLeft,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { 
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5 
} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import CommunityHomeActions from '@/component/CommunityHomeActions';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 250; // Fixed header height

const CommunityDetail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { community: communityParam, id }: any = useLocalSearchParams();
  const community = JSON.parse(communityParam);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const animationProgress = useSharedValue(0);

  const { theme } = useTheme();
    const { t } = useTranslation();

  // Reset animations when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Reset state on focus
      setImageLoaded(false);
      
      // Reset animations
      animationProgress.value = 0;
      
      // Start animations
      animationProgress.value = withTiming(1, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      return () => {
        // Cleanup animations when screen loses focus
        cancelAnimation(animationProgress);
      };
    }, [id, communityParam]) // Re-run when community changes
  );

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(animationProgress.value * 0.6),
    };
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        {/* Background placeholder while image loads */}
        <View style={styles.imagePlaceholder} />
        
        {/* Animated image with onLoad handler */}
        <Animated.Image
          source={{ uri: community.image }}
          style={[styles.headerImage, {width: SCREEN_WIDTH, height: HEADER_HEIGHT}]}
          onLoad={handleImageLoad}
        />
        
        {/* Show loading indicator until image is loaded */}
        {!imageLoaded && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        
        <Animated.View style={[styles.imageOverlay, overlayStyle]} />
      </View>

      {/* Header Actions */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        {/* <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="share-social" size={22} color="white" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={22} color="white" />
          </Pressable>
        </View> */}
      </View>

      <ScrollView
        style={[styles.scrollView, { marginTop: HEADER_HEIGHT - 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.titleContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.detailTitle, { color: theme.colors.text }]}>{community.name}</Text>
            <View style={styles.statsContainer}>
              <Animated.View 
                entering={FadeInLeft.delay(400).duration(600)}
                style={styles.statItem}
                key={`members-${id}`}
              >
                <MaterialCommunityIcons name="account-group" size={24} color={ theme.colors.placeholder} />
                <Text style={[styles.statText, { color: theme.colors.placeholder }]}>{community.users} members</Text>
              </Animated.View>
              <Animated.View 
                entering={FadeInLeft.delay(600).duration(600)}
                style={styles.statItem}
                key={`posts-${id}`}
              >
                <FontAwesome5 name="newspaper" size={20} color={ theme.colors.placeholder} />
                <Text style={[styles.statText, { color: theme.colors.placeholder }]}>{community.posts} posts</Text>
              </Animated.View>
            </View>
          </View>

          <Animated.View 
            entering={FadeInDown.delay(800).duration(600)}
            style={[styles.descriptionContainer, { backgroundColor: theme.colors.background }]}
            key={`description-${id}`}
          >
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information" size={24} color={ theme.colors.text } />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About Community</Text>
            </View>
            <Text style={[styles.description, { color: theme.colors.text }]}>{community.description}</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={20} color={ theme.colors.placeholder} />
              <Text style={[styles.dateText, { color: theme.colors.placeholder }]}>
                Created on {new Date(community.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E0E0E0', // Light gray placeholder
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    padding: 20,
    paddingBottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  descriptionContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  joinContainer: {
    padding: 20,
    paddingTop: 0,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default CommunityDetail;