import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const { height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { 
    login, 
    isLoginLoading
  } = useAuth();
    
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = t('errors.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('errors.invalidEmail');
      isValid = false;
    }

    if (!password) {
      newErrors.password = t('errors.passwordRequired');
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = t('errors.passwordTooShort');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setGeneralError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      // No need to navigate here - the hook handles it
    } catch (error: any) {
      setGeneralError(error.message || t('errors.loginFailed'));
      setIsLoading(false);

    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Enhanced gradient colors
  const gradientColors: [string, string, ...string[]] = isDark 
    ? ['#121212', '#1E1E1E', '#232323'] 
    : ['#2E8B57', '#3B8C6E', '#4CAF50'];

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "light"} />
      
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
          <View style={[styles.decorationCircle, styles.decorationCircle3, { backgroundColor: `${theme.colors.accent}10` }]} />
        </View>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View 
                style={styles.logoContainer}
                entering={FadeInDown.duration(600).delay(200)}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.logoCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="leaf" size={40} color="#fff" />
                </LinearGradient>
                <Text style={styles.appName}>AgriModel</Text>
                <Text style={styles.tagline}>{t('login.subtitle')}</Text>
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
                  {t('login.title')}
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
                    label={t('login.email')}
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    leftIcon={
                      <Ionicons 
                        name="mail-outline" 
                        size={20} 
                        color={theme.colors.text} 
                      />
                    }
                    containerStyle={styles.input}
                  />
                  
                  <Input
                    label={t('login.password')}
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    error={errors.password}
                    leftIcon={
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color={theme.colors.text} 
                      />
                    }
                    rightIcon={
                      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIconContainer}>
                        <Ionicons 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color={theme.colors.text} 
                        />
                      </TouchableOpacity>
                    }
                    containerStyle={styles.input}
                  />
                </View>
                
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forget')}
                  style={styles.forgotPasswordContainer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPassword}>
                    {t('login.forgotPassword')}
                  </Text>
                </TouchableOpacity>
                
                <LinearGradient
                  colors={isDark ? [theme.colors.primary, theme.colors.secondary] : ['#fff', '#f8f8f8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  <Button
                    title={t('login.loginButton')}
                    onPress={handleLogin}
                    loading={isLoading}
                    disabled={isLoginLoading}
                    style={styles.loginButton}
                    textStyle={{ 
                      color: isDark ? '#fff' : theme.colors.primary,
                      fontWeight: '600',
                      fontSize: 16
                    }}
                  />
                </LinearGradient>
                
                {/* <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>
                
                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#DB4437', '#CB3F33']}
                      style={styles.socialButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="logo-google" size={20} color="#fff" />
                      <Text style={styles.socialButtonText}>Google</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isDark ? ['#fff', '#f1f1f1'] : ['#000', '#333']}
                      style={styles.socialButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons 
                        name="logo-apple" 
                        size={20} 
                        color={isDark ? '#000' : '#fff'} 
                      />
                      <Text style={[
                        styles.socialButtonText, 
                        { color: isDark ? '#000' : '#fff' }
                      ]}>
                        Apple
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View> */}
                
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>
                    {t('login.noAccount')}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/(auth)/signup')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signupButtonText}>
                      {t('login.signupNow')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
  decorationCircle3: {
    width: 200,
    height: 200,
    bottom: -50,
    right: -30,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
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
    marginBottom: 24,
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
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 18,
  },
  eyeIconContainer: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    paddingVertical: 4,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  loginButtonGradient: {
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
  loginButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    width: '48%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  socialButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  socialButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 15,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
  },
  signupButtonText: {
    fontWeight: 'bold',
    marginLeft: 5,
    color: '#fff',
    fontSize: 15,
  },
});