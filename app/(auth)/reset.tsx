import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetPassword() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  const { email, code }: any = useLocalSearchParams();

  const { 
    resetPassword, 
    isResetPasswordLoading 
  } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    let isValid = true;
    const newErrors = { newPassword: '', confirmPassword: '' };
    
    // Password validation
    if (!newPassword) {
      newErrors.newPassword = t('reset.passwordRequired', 'New password is required');
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('reset.passwordTooShort', 'Password must be at least 6 characters');
      isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = t('reset.confirmRequired', 'Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = t('reset.passwordsDoNotMatch', 'Passwords do not match');
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  
  const handleReset = async () => {
    if (!validateForm()) return;
      setIsLoading(true);
      setGeneralError('');
    try {
      await resetPassword(email, code, newPassword, confirmPassword);
      // Navigation handled in the hook
    } catch (error: any) {
        setGeneralError(error.message || t('errors.signupFailed'));
        setIsLoading(false);
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
              <Ionicons name="lock-open" size={40} color="#fff" />
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
              {t('reset.title', 'Reset Password')}
            </Text>
            
            <Text style={styles.subtitle}>
              {t('reset.subtitle', 'Create a new password for your account')}
            </Text>

            {generalError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={theme.colors.danger} style={styles.errorIcon} />
                <Text style={styles.errorText}>
                  {generalError}
                </Text>
              </View>
            ) : null}
            
            <View style={styles.inputContainer}>
              <Input
                label={t('reset.newPassword', 'New Password')}
                placeholder={t('reset.newPasswordPlaceholder', 'Enter new password')}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                error={errors.newPassword}
                leftIcon={
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={theme.colors.text} 
                  />
                }
                rightIcon={
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons 
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={theme.colors.text} 
                    />
                  </TouchableOpacity>
                }
                containerStyle={styles.input}
              />
              
              <Input
                label={t('reset.confirmPassword', 'Confirm Password')}
                placeholder={t('reset.confirmPasswordPlaceholder', 'Confirm new password')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                leftIcon={
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={theme.colors.text} 
                  />
                }
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={theme.colors.text} 
                    />
                  </TouchableOpacity>
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
                title={t('reset.resetButton', 'Reset Password')}
                onPress={handleReset}
                loading={isLoading}
                disabled={isResetPasswordLoading}
                style={styles.button}
                textStyle={{ 
                  color: isDark ? '#fff' : theme.colors.primary,
                  fontWeight: '600',
                  fontSize: 16
                }}
              />
            </LinearGradient>
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
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