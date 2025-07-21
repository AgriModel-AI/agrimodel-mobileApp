import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';


interface AskCommunityButtonProps {
  onPress: () => void;
  visible: boolean;
}

export const AskCommunityButton = ({ onPress, visible }: AskCommunityButtonProps) => {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(visible ? 1 : 0, { damping: 12 }) }
      ],
      opacity: withSpring(visible ? 1 : 0)
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, { bottom: tabBarHeight + 24 }]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onPress}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});