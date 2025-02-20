import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Easing, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { Text } from 'react-native';
import CustomHeader from '@/component/CustomHeader';

interface TabLabelProps {
  title: string;
  color: string;
  focused: boolean;
  style?: TextStyle;
}

interface TabIconProps {
  name: keyof typeof Feather.glyphMap;
  color: string;
  focused: boolean;
  scale: Animated.Value;
}

export const TabLabel: React.FC<TabLabelProps> = ({ 
  title, 
  color, 
  focused, 
  style 
}) => {
  return (
    <Text
      style={[
        {
          color,
          fontSize: 12,
          fontFamily: focused ? 'Poppins_700Bold' : 'Poppins_400Regular',
          paddingBottom: 0,
        },
        style
      ]}
    >
      {title}
    </Text>
  );
};

const TabIcon: React.FC<TabIconProps> = ({ name, color, focused, scale }) => {
  if (focused) {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Feather name={name} size={20} color={color} />
    </Animated.View>
  );
};

export default function TabLayout() {
  const { theme } = useTheme();

  // Fix: Create a separate animated value for each tab
  const createAnimatedScale = () => new Animated.Value(1);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          paddingBottom: 0,      // Removed padding below items
          paddingTop: 0,         // Removed padding above items
          height: 60,            // Fixed height to avoid excess space
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarItemStyle: {
          paddingBottom: 0,      // Removed item padding
          marginBottom: 0,       // Removed item margin
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel title="Home" color={color} focused={focused} />,
          tabBarIcon: ({ color, focused }) => {
            const animatedScale = createAnimatedScale();
            return <TabIcon name="home" color={color} focused={focused} scale={animatedScale} />;
          },
          header: () => <CustomHeader />,
          headerTransparent: true,
        }}
      />

      {/* Diagnosis Tab */}
      <Tabs.Screen
        name="diagnosis"
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel title="Diagnosis" color={color} focused={focused} />,
          headerShown: false,
          tabBarIcon: ({ color, focused }) => {
            const animatedScale = createAnimatedScale();
            return <TabIcon name="activity" color={color} focused={focused} scale={animatedScale} />;
          },
        }}
      />

      {/* Community Tab */}
      <Tabs.Screen
        name="community"
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel title="Community" color={color} focused={focused} />,
          headerShown: false,
          tabBarIcon: ({ color, focused }) => {
            const animatedScale = createAnimatedScale();
            return <TabIcon name="users" color={color} focused={focused} scale={animatedScale} />;
          },
        }}
        
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel title="Profile" color={color} focused={focused} />,
          headerShown: false,
          tabBarIcon: ({ color, focused }) => {
            const animatedScale = createAnimatedScale();
            return <TabIcon name="user" color={color} focused={focused} scale={animatedScale} />;
          },
        }}
      />
    </Tabs>
  );
}
