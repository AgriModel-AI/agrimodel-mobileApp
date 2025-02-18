import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue, 
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';

const CommunitySkeleton = ({ count = 3 }) => {
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
        styles.communityItem,
        { backgroundColor: theme.colors.inputBackground },
        animatedStyle
      ]}
    >
      {/* Community Image Skeleton */}
      <View 
        style={[
          styles.communityImage,
          { backgroundColor: theme.colors.skeleton }
        ]} 
      />
      
      {/* Community Info Skeleton */}
      <View style={styles.communityInfo}>
        <View 
          style={[
            styles.titleSkeleton,
            { backgroundColor: theme.colors.skeleton }
          ]}
        />
        <View 
          style={[
            styles.membersSkeleton,
            { backgroundColor: theme.colors.skeleton }
          ]}
        />
      </View>

      {/* Join Button Skeleton */}
      <View 
        style={[
          styles.buttonSkeleton,
          { backgroundColor: theme.colors.skeleton }
        ]}
      />
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
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
    gap: 8,
  },
  titleSkeleton: {
    height: 20,
    width: '60%',
    borderRadius: 4,
  },
  membersSkeleton: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  buttonSkeleton: {
    width: 80,
    height: 36,
    borderRadius: 20,
  },
});

export default CommunitySkeleton;