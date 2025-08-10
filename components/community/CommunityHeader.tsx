import { Community } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { CommunitySelector } from './CommunitySelector';

interface CommunityHeaderProps {
  communities: Community[];
  selectedCommunityId: number | null;
  onSelectCommunity: (communityId: number | null) => void;
  scrollY: Animated.Value;
}

export const CommunityHeader = ({ 
  communities, 
  selectedCommunityId, 
  onSelectCommunity,
  scrollY
}: CommunityHeaderProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  // Animation values - Fixed ranges
  const headerHeight = 180; // Full height
  const collapsedHeight = 55; // Collapsed height (smaller for better effect)
  const scrollRange = 120; // Fixed scroll range
  
  // Dynamic height animation
  const animatedHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [headerHeight + insets.top, collapsedHeight + insets.top],
    extrapolate: 'clamp',
  });
  
  // Content fade and slide animation
  const contentOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.4, scrollRange * 0.8],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });
  
  // Title modern scale and position
  const titleScale = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 0.75],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [0, -5],
    extrapolate: 'clamp',
  });

  // Content smooth slide up
  const contentTranslateY = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  // Action buttons modern animation
  const actionScale = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.5, scrollRange],
    outputRange: [1, 0.9, 0.8],
    extrapolate: 'clamp',
  });

  const actionOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 1], // Keep full opacity
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          height: animatedHeight,
        }
      ]}
    >
      {/* Enhanced shadow/border effect */}
      <View style={[styles.shadowOverlay, { backgroundColor: theme.colors.background }]} />
      
      <View style={styles.topRow}>
        <Animated.View
          style={{
            transform: [
              { scale: titleScale },
              { translateY: titleTranslateY }
            ]
          }}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('community.title', 'Community')}
          </Text>
        </Animated.View>
        
        <Animated.View style={[
          styles.actions, 
          { 
            opacity: actionOpacity,
            transform: [{ scale: actionScale }]
          }
        ]}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { backgroundColor: theme.colors.background },
              styles.actionButtonModern
            ]}
            onPress={() => router.push('/(authenticated)/(modals)/my-communities')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
                styles.actionButton, 
                { backgroundColor: theme.colors.background },
                styles.actionButtonModern
            ]}
            onPress={() => router.push('/(authenticated)/(tabs)/community/my-posts')}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <Animated.View style={[styles.content, { 
        opacity: contentOpacity,
        transform: [{ translateY: contentTranslateY }]
      }]}>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {t('community.subtitle', 'Connect with your agricultural communities and share knowledge')}
        </Text>
        
        <View style={styles.selectorContainer}>
          <CommunitySelector
            communities={communities}
            selectedCommunityId={selectedCommunityId}
            onSelectCommunity={onSelectCommunity}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  shadowOverlay: {
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
    height: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 8,
    minHeight: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.75,
    marginBottom: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  selectorContainer: {
    marginTop: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonModern: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    transform: [{ scale: 1 }],
  },
});