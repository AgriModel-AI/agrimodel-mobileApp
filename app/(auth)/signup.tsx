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
  ScrollView,
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

export default function Signup() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const { 
    signup, 
    isSignupLoading
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({ email: '', username: '', password: '', phoneNumber: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', username: '', password: '', phoneNumber: '' };

    // Email validation
    if (!email) {
      newErrors.email = t('errors.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('errors.invalidEmail');
      isValid = false;
    }

    // Username validation
    if (!username) {
      newErrors.username = t('errors.usernameRequired');
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = t('errors.usernameTooShort');
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = t('errors.passwordRequired');
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = t('errors.passwordTooShort');
      isValid = false;
    }

    // Phone number validation
    if (!phoneNumber) {
      newErrors.phoneNumber = t('errors.phoneRequired');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setGeneralError('');
    setIsLoading(true);
    
    try {
      await signup(email, username, password, phoneNumber);
      // Navigation handled in the hook
    } catch (error: any) {
      setGeneralError(error.message || t('errors.signupFailed'));
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
          <View style={[styles.decorationCircle, styles.decorationCircle3, { backgroundColor: `${theme.colors.accent}10` }]} />
        </View>

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
                {t('signup.title', 'Create Account')}
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
                  label={t('signup.email', 'Email')}
                  placeholder={t('signup.emailPlaceholder', 'Enter your email')}
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
                  label={t('signup.username', 'Username')}
                  placeholder={t('signup.usernamePlaceholder', 'Choose a username')}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  error={errors.username}
                  leftIcon={
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={theme.colors.text} 
                    />
                  }
                  containerStyle={styles.input}
                />
                
                <Input
                  label={t('signup.password', 'Password')}
                  placeholder={t('signup.passwordPlaceholder', 'Create a password')}
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
                
                <Input
                  label={t('signup.phoneNumber', 'Phone Number')}
                  placeholder={t('signup.phonePlaceholder', 'Enter your phone number')}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                  leftIcon={
                    <Ionicons 
                      name="call-outline" 
                      size={20} 
                      color={theme.colors.text} 
                    />
                  }
                  containerStyle={styles.input}
                />
              </View>
              
              <LinearGradient
                colors={isDark ? [theme.colors.primary, theme.colors.secondary] : ['#fff', '#f8f8f8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupButtonGradient}
              >
                <Button
                  title={t('signup.signupButton', 'Sign Up')}
                  onPress={handleSignup}
                  loading={isLoading}
                  disabled={isSignupLoading}
                  style={styles.signupButton}
                  textStyle={{ 
                    color: isDark ? '#fff' : theme.colors.primary,
                    fontWeight: '600',
                    fontSize: 16
                  }}
                />
              </LinearGradient>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  {t('signup.haveAccount', 'Already have an account?')}
                </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginButtonText}>
                    {t('signup.loginNow', 'Log In')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
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
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
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
    fontSize: 24,
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
    marginBottom: 16,
  },
  eyeIconContainer: {
    padding: 8,
  },
  signupButtonGradient: {
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
  signupButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
  },
  loginButtonText: {
    fontWeight: 'bold',
    marginLeft: 5,
    color: '#fff',
    fontSize: 15,
  },
});