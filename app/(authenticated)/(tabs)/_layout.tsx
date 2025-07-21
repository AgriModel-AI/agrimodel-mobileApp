import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';

const TAB_COUNT = 5;

interface CenteredTabBarButtonProps {
  children: React.ReactNode;
  onPress: () => void;
}

export default function TabsLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tabPressAnimations = Array(TAB_COUNT).fill(0).map(() => useSharedValue(0));

  const getIconAnimatedStyle = (index: number) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAnimatedStyle(() => {
      const scale = interpolate(
        tabPressAnimations[index].value,
        [0, 0.5, 1],
        [1, 0.9, 1],
        Extrapolate.CLAMP
      );

      return {
        transform: [
          { scale: activeIndex.value === index ? withTiming(1.1, { duration: 200 }) : withTiming(1, { duration: 200 }) },
          { scale: scale }
        ],
      };
    });
  };

  const getIconColor = (focused: boolean) => {
    return focused ? theme.colors.primary : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)');
  };

  const animateTabPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    tabPressAnimations[index].value = withSequence(
      withTiming(1, { duration: 100, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 100, easing: Easing.inOut(Easing.quad) })
    );
  };

  const CenteredTabBarButton: React.FC<CenteredTabBarButtonProps> = ({ children, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.centeredTabButton, {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
      }]}
    >
      {children}
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={({ route, navigation }) => {
        const currentIndex = navigation.getState().index;
        const routeName = route.name;
        let tabIndex = 0;

        if (routeName === 'home') tabIndex = 0;
        else if (routeName === 'explore') tabIndex = 1;
        else if (routeName === 'diagnosis') tabIndex = 2;
        else if (routeName === 'community') tabIndex = 3;
        else if (routeName === 'profile') tabIndex = 4;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (currentIndex === tabIndex) {
            activeIndex.value = tabIndex;
            animateTabPress(tabIndex);
          }
        }, [currentIndex, tabIndex]);

        const isCenterTab = routeName === 'diagnosis';

        return {
          headerShown: false,
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            position: 'absolute',
            bottom: 0,
            paddingHorizontal: 0,
            ...(Platform.OS === 'ios' ? {
              height: 80 + insets.bottom,
              paddingBottom: insets.bottom,
            } : {})
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: isCenterTab ? 0 : -5,
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
          tabBarButton: (props: any) => {
            if (isCenterTab) {
              return (
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <CenteredTabBarButton {...props} onPress={() => {
                    props.onPress();
                    animateTabPress(tabIndex);
                  }}>
                    {props.children}
                  </CenteredTabBarButton>
                </View>
              );
            }

            return (
              <Pressable
                {...props}
                onPress={(e) => {
                  props.onPress(e);
                  animateTabPress(tabIndex);
                }}
                style={[props.style]}
              />
            );
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderTopLeftRadius: 30, borderTopRightRadius: 30 }]}>
              <BlurView
                tint={isDark ? 'dark' : 'light'}
                intensity={isDark ? 40 : 70}
                style={[StyleSheet.absoluteFill, {
                  backgroundColor: isDark ? 'rgba(20, 20, 20, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderTopWidth: 1,
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }]}
              />
              {/* Animation has been removed from here */}
            </View>
          ),
        };
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Animated.View style={[styles.iconContainer, getIconAnimatedStyle(0)]}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={getIconColor(focused)} />
            </Animated.View>
          ),
          tabBarLabel: ({ focused }) => (
            <Animated.Text style={{
              color: getIconColor(focused),
              fontSize: 11,
              fontWeight: focused ? '600' : '400',
            }}>
              Home
            </Animated.Text>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <Animated.View style={[styles.iconContainer, getIconAnimatedStyle(1)]}>
              <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={getIconColor(focused)} />
            </Animated.View>
          ),
          tabBarLabel: ({ focused }) => (
            <Animated.Text style={{
              color: getIconColor(focused),
              fontSize: 11,
              fontWeight: focused ? '600' : '400',
            }}>
              Explore
            </Animated.Text>
          ),
        }}
      />

      <Tabs.Screen
        name="diagnosis"
        options={{
          title: 'Scan',
          tabBarLabel: () => null, // No label for the center tab
          tabBarIcon: () => (
            <Animated.View style={[styles.centeredIconContainer, getIconAnimatedStyle(2)]}>
              <Ionicons name="leaf" size={26} color="#fff" />
            </Animated.View>
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => (
            <Animated.View style={[styles.iconContainer, getIconAnimatedStyle(3)]}>
              <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={getIconColor(focused)} />
            </Animated.View>
          ),
          tabBarLabel: ({ focused }) => (
            <Animated.Text style={{
              color: getIconColor(focused),
              fontSize: 11,
              fontWeight: focused ? '600' : '400',
            }}>
              Community
            </Animated.Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Animated.View style={[styles.iconContainer, getIconAnimatedStyle(4)]}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={getIconColor(focused)} />
            </Animated.View>
          ),
          tabBarLabel: ({ focused }) => (
            <Animated.Text style={{
              color: getIconColor(focused),
              fontSize: 11,
              fontWeight: focused ? '600' : '400',
            }}>
              Profile
            </Animated.Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  centeredTabButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 5,
  },
  centeredIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
});