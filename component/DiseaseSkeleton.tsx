import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue, 
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';

const DiseaseSkeleton = ({ count = 3 }) => {
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
      style={[styles.cropItem, animatedStyle]}
    >
      {/* Circular Image Skeleton */}
      <View 
        style={[
          styles.cropImage,
          { backgroundColor: theme.colors.inputBackground }
        ]} 
      />
      
      {/* Name Skeleton */}
      <View 
        style={[
          styles.cropName,
          { backgroundColor: theme.colors.inputBackground }
        ]}
      />
    </Animated.View>
  );

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {Array(count).fill(0).map((_, index) => renderSkeletonItem(index))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contentContainer: {
    paddingRight: 16,
  },
  cropItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  cropImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  cropName: {
    height: 16,
    width: 80,
    borderRadius: 4,
  },
});

export default DiseaseSkeleton;