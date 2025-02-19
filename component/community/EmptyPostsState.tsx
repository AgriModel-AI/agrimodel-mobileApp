import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmptyPostsState = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate icon with bounce
    iconScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );

    // Fade in title after icon
    titleOpacity.value = withDelay(400, 
      withSpring(1, { damping: 20 })
    );

    // Fade in description last
    descriptionOpacity.value = withDelay(800,
      withSpring(1, { damping: 20 })
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: withSpring(20 - (titleOpacity.value * 20)) }],
  }));

  const descriptionStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
    transform: [{ translateY: withSpring(20 - (descriptionOpacity.value * 20)) }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <MaterialCommunityIcons 
          name="post-outline" 
          size={80} 
          color={theme.colors.text} 
        />
      </Animated.View>
      
      <Animated.Text style={[
        styles.title, 
        titleStyle,
        { color: theme.colors.text }
      ]}>
        {t('community.emptyPosts.title')}
      </Animated.Text>
      
      <Animated.Text style={[
        styles.description,
        descriptionStyle,
        { color: theme.colors.text }
      ]}>
        {t('community.emptyPosts.description')}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyPostsState;