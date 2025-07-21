import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface AnimatedHeaderProps {
  title: string;
  scrollY: Animated.Value;
  showBackButton?: boolean;
}

export const AnimatedHeader = ({ title, scrollY, showBackButton = true }: AnimatedHeaderProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Animation values
  const headerHeight = 80;
  const collapsedHeight = 55;
  const scrollRange = 60;
  
  // Dynamic height animation
  const animatedHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [headerHeight + insets.top, collapsedHeight + insets.top],
    extrapolate: 'clamp',
  });
  
  // Title animation (stays in top row)
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.8],
    outputRange: [1, 1],
    extrapolate: 'clamp',
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  // Back button animation
  const backButtonScale = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.header, 
        { 
          backgroundColor: theme.colors.background,
          paddingTop: insets.top ,
          height: animatedHeight,
          borderBottomColor: theme.colors.border,
        }
      ]}
    >
      {/* Enhanced shadow overlay */}
      <View style={[styles.shadowOverlay, { backgroundColor: theme.colors.background }]} />
      
      <View style={styles.topRow}>
        {showBackButton && (
          <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
            <TouchableOpacity 
              style={[
                styles.backButton,
                { backgroundColor: theme.colors.background },
                styles.backButtonModern
              ]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <Animated.Text 
          style={[
            styles.title, 
            { 
              color: theme.colors.text,
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            }
          ]}
        >
          {title}
        </Animated.Text>
        
        <View style={styles.rightSpacer} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 5,
    overflow: 'hidden',
  }, 
  shadowOverlay: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    height: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonModern: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    textAlign: 'center',
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  rightSpacer: {
    width: 40,
  },
});