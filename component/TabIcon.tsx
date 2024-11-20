import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Easing } from 'react-native-reanimated';

const TabIcon = ({
  name,
  color,
  focused,
}: {
  name: 'home' | 'activity' | 'users' | 'user'; // Only valid Feather icon names
  color: string;
  focused: boolean;
}) => {
  const scale = new Animated.Value(0);

  // Run the fade animation for the circle
  useEffect(() => {
    if (focused) {
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(0); // Reset animation when not focused
    }
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      {/* Circle Animation */}
      {focused && (
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale }],
              opacity: scale,
            },
          ]}
        />
      )}
      {/* Tab Icon */}
      <Feather name={name} size={20} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  circle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.3)', // Adjust color and opacity as needed
  },
});

export default TabIcon;
