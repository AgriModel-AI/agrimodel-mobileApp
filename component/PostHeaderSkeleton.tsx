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

// Header Skeleton Component
const PostHeaderSkeleton = () => {
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

  return (
    <Animated.View style={[styles.mainContent]}>
      <View style={styles.dropdown}>
        <View style={styles.dropdownContent}>
          <Animated.View 
            style={[
              styles.dropdownTextSkeleton,
              { backgroundColor: theme.colors.skeleton },
              animatedStyle
            ]}
          />
          <Animated.View 
            style={[
              styles.iconSkeleton,
              { backgroundColor: theme.colors.skeleton },
              animatedStyle
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownTextSkeleton: {
    height: 24,
    width: 150,
    borderRadius: 4,
  },
  iconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});

// Export both components
export default PostHeaderSkeleton;