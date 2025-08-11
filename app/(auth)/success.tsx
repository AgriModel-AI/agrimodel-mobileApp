import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

const { height } = Dimensions.get('window');

export default function Success() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Enhanced gradient colors
  const gradientColors: [string, string, ...string[]] = isDark 
    ? ['#121212', '#1E1E1E', '#232323'] 
    : ['#2E8B57', '#3B8C6E', '#4CAF50'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={gradientColors}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background decoration elements */}
        <View style={styles.decorationContainer}>
          <View style={[styles.decorationCircle, styles.decorationCircle1, { backgroundColor: `${theme.colors.primary}20` }]} />
          <View style={[styles.decorationCircle, styles.decorationCircle2, { backgroundColor: `${theme.colors.secondary}15` }]} />
        </View>

        <View style={styles.content}>
          <Animated.View 
            style={styles.successIconContainer}
            entering={ZoomIn.duration(800).delay(300)}
          >
            {/* You can use LottieView for a nice animation or just an icon */}
            <View style={styles.successCircle}>
              <Ionicons name="checkmark-circle" size={80} color="#fff" />
            </View>
          </Animated.View>
          
          <Animated.View
            entering={FadeIn.duration(1000).delay(500)}
          >
            <Text style={styles.title}>
              {t('success.title', 'Success!')}
            </Text>
            
            <Text style={styles.message}>
              {t('success.passwordReset', 'Your account is now ready to use. You can log in with your credentials.')}
            </Text>
          </Animated.View>
          
          <Animated.View
            entering={FadeIn.duration(1000).delay(800)}
            style={styles.buttonContainer}
          >
            <LinearGradient
              colors={isDark ? [theme.colors.primary, theme.colors.secondary] : ['#fff', '#f8f8f8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Button
                title={t('success.loginButton', 'Login')}
                onPress={() => router.push('/(auth)/login')}
                style={styles.button}
                textStyle={{ 
                  color: isDark ? '#fff' : theme.colors.primary,
                  fontWeight: '600',
                  fontSize: 16
                }}
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  decorationContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  decorationCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  decorationCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -50,
  },
  decorationCircle2: {
    width: 250,
    height: 250,
    bottom: height * 0.3,
    left: -100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
  },
  buttonGradient: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
});