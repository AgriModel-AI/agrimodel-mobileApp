import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../contexts/ThemeContext';

import { useAuth } from '../../hooks/useAuth';

const { height } = Dimensions.get('window');

export default function ForgetPassword() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const { 
    forgotPassword, 
    isForgotPasswordLoading
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError(t('errors.emailRequired', 'Email is required'));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('errors.invalidEmail', 'Please enter a valid email address'));
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      // Navigation handled in the hook
    } catch (err: any) {
      setError(err.message || t('errors.requestFailed'));
    }
  };

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

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Animated.View 
            style={styles.iconContainer}
            entering={FadeInDown.duration(600).delay(200)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="key" size={40} color="#fff" />
            </View>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInUp.duration(800).delay(400)}
            style={[styles.card, { 
              backgroundColor: isDark ? `${theme.colors.card}95` : 'rgba(255, 255, 255, 0.15)',
              borderColor: `${theme.colors.border}30`,
              borderWidth: 1,
            }]}
          >
            <Text style={styles.title}>
              {t('forget.title', 'Forgot Password')}
            </Text>
            
            <Text style={styles.subtitle}>
              {t('forget.subtitle', 'Enter your email address and we\'ll send you a code to reset your password')}
            </Text>
            
            <View style={styles.inputContainer}>
              <Input
                label={t('forget.email', 'Email')}
                placeholder={t('forget.emailPlaceholder', 'Enter your email address')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
                leftIcon={
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={theme.colors.text} 
                  />
                }
              />
            </View>
            
            <LinearGradient
              colors={isDark ? [theme.colors.primary, theme.colors.secondary] : ['#fff', '#f8f8f8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Button
                title={t('forget.sendButton', 'Send Code')}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isForgotPasswordLoading}
                style={styles.button}
                textStyle={{ 
                  color: isDark ? '#fff' : theme.colors.primary,
                  fontWeight: '600',
                  fontSize: 16
                }}
              />
            </LinearGradient>
            
            <View style={styles.linkContainer}>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>
                  {t('forget.backToLogin', 'Back to Login')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  card: {
    borderRadius: 24,
    padding: 28,
    backdropFilter: 'blur(10px)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
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
  linkContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
    padding: 8,
  },
});