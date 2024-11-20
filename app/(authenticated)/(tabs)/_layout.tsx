import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';

export default function TabLayout() {
  const { theme } = useTheme();

  // Animation state for active/inactive tabs
  const animatedScale = new Animated.Value(2);

  const animateTab = () => {
    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 1.2, // Scale up
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 1, // Scale back
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background, // Tab bar background color
          shadowColor: '#000', // Shadow color
          shadowOffset: { width: 0, height: 1 }, // Shadow offset
          shadowOpacity: 0.1, // Shadow opacity
          shadowRadius: 2, // Shadow blur radius
          elevation: 6, // Shadow on Android
          height: 70,
          paddingHorizontal: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: theme.colors.primary, // Active tab color
        tabBarInactiveTintColor: theme.colors.text, // Inactive tab color
        tabBarLabelStyle: {
          fontSize: 12, // Font size for labels
          fontFamily: 'Poppins_400Regular', // Custom font
        },
        tabBarItemStyle: {
          marginBottom: 5, // Spacing between items
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => {
            if (focused) animateTab(); // Trigger animation on focus
            return (
              <Animated.View style={{ transform: [{ scale: focused ? animatedScale : 1 }] }}>
                <Feather name={focused ? 'home' : 'home'} size={20} color={color} />
              </Animated.View>
            );
          },
        }}
      />
      {/* Diagnosis Tab */}
      <Tabs.Screen
        name="diagnosis/index"
        options={{
          tabBarLabel: 'Diagnosis',
          tabBarIcon: ({ color, focused }) => {
            if (focused) animateTab(); // Trigger animation on focus
            return (
              <Animated.View style={{ transform: [{ scale: focused ? animatedScale : 1 }] }}>
                <Feather name={focused ? 'activity' : 'activity'} size={20} color={color} />
              </Animated.View>
            );
          },
        }}
      />
      {/* Community Tab */}
      <Tabs.Screen
        name="community/index"
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, focused }) => {
            if (focused) animateTab(); // Trigger animation on focus
            return (
              <Animated.View style={{ transform: [{ scale: focused ? animatedScale : 1 }] }}>
                <Feather name={focused ? 'users' : 'users'} size={20} color={color} />
              </Animated.View>
            );
          },
        }}
      />
      {/* Profile Tab */}
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => {
            if (focused) animateTab(); // Trigger animation on focus
            return (
              <Animated.View style={{ transform: [{ scale: focused ? animatedScale : 1 }] }}>
                <Feather name={focused ? 'user' : 'user'} size={20} color={color} />
              </Animated.View>
            );
          },
        }}
      />
    </Tabs>
  );
}
