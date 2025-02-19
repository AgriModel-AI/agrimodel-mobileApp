import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';

const PostCardSkeleton = ({ count = 3 }) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderSkeletonItem = (index: React.Key | null | undefined) => (
    <Animated.View
      key={index}
      style={[
        styles.postCard,
        { backgroundColor: theme.colors.inputBackground, borderBottomColor: theme.colors.inputBackground },
        animatedStyle
      ]}
    >
      {/* User Info Skeleton */}
      <View style={styles.userInfo}>
        <View
          style={[
            styles.userAvatar,
            { backgroundColor: theme.colors.skeleton }
          ]}
        />
        <View style={styles.userInfoText}>
          <View
            style={[
              styles.userNameSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />
          <View
            style={[
              styles.postTimeSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />
        </View>
      </View>

      {/* Post Description Skeleton */}
      <View
        style={[
          styles.postDescriptionSkeleton,
          { backgroundColor: theme.colors.skeleton }
        ]}
      />

      {/* Post Image Skeleton */}
      <View
        style={[
          styles.postImageSkeleton,
          { backgroundColor: theme.colors.skeleton }
        ]}
      />

      {/* Post Actions Skeleton */}
      <View style={styles.postActions}>
        <View style={styles.actionItem}>
          <View
            style={[
              styles.actionIconSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />
          <View
            style={[
              styles.actionTextSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />
        </View>

        <View style={styles.actionItem}>
          <View
            style={[
              styles.actionIconSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />
          <View
            style={[
              styles.actionTextSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {Array(count).fill(0).map((_, index) => renderSkeletonItem(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  userInfoText: {
    flex: 1,
    gap: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userNameSkeleton: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  postTimeSkeleton: {
    height: 12,
    width: '30%',
    borderRadius: 4,
  },
  postDescriptionSkeleton: {
    height: 14,
    width: '90%',
    borderRadius: 4,
    marginBottom: 10,
  },
  postImageSkeleton: {
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
    gap: 5,
  },
  actionIconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  actionTextSkeleton: {
    height: 14,
    width: 60,
    borderRadius: 4,
  },
});

export default PostCardSkeleton;