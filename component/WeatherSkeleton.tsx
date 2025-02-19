import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue, 
  withSpring
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';

const WeatherSkeleton = () => {
  const { theme } = useTheme();
  
  // Animation values
  const opacity = useSharedValue(0.3);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    // Pulse animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1,
      true
    );

    // Card scale animation
    cardScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <Animated.View 
        style={[
          styles.weatherCard, 
          { backgroundColor: 'rgba(83, 158, 246, 0.3)' },
          animatedStyle
        ]}
      >
        {/* Location and Date Skeleton */}
        <View 
          style={[
            styles.locationSkeleton,
            { backgroundColor: theme.colors.skeleton }
          ]}
        />

        {/* Weather Info Skeleton */}
        <View style={styles.weatherInfo}>
          {/* Temperature Skeleton */}
          <View 
            style={[
              styles.temperatureSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />

          {/* Humidity Detail Skeleton */}
          <View style={styles.detailRow}>
            <View 
              style={[
                styles.iconSkeleton,
                { backgroundColor: theme.colors.skeleton }
              ]}
            />
            <View 
              style={[
                styles.detailSkeleton,
                { backgroundColor: theme.colors.skeleton }
              ]}
            />
          </View>

          {/* Weather Icon Skeleton */}
          <View 
            style={[
              styles.weatherIconSkeleton,
              { backgroundColor: theme.colors.skeleton }
            ]}
          />
        </View>

        {/* Weather Advice Skeleton */}
        <View 
          style={[
            styles.adviceSkeleton,
            { backgroundColor: theme.colors.skeleton }
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  weatherCard: {
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationSkeleton: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  temperatureSkeleton: {
    height: 32,
    width: 80,
    borderRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  detailSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  weatherIconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  adviceSkeleton: {
    height: 14,
    width: '90%',
    borderRadius: 4,
  },
});

export default WeatherSkeleton;