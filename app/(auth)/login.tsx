import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
  ToastAndroid,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/ThemeProvider';
import { Link, useRouter } from 'expo-router';
import { globalStyles as styles } from '@/styles/auth/globalStyles';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';
import { login, logout } from '@/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import showToast from '@/component/showToast';

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [loadingGAuth, setLoadingGAuth] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  const validateInputs = () => {
    if (!email) {
      showToast('Email is required.', 'info');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address.', 'info');
      return false;
    }
    if (!password) {
      showToast('Password is required.', 'info');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });

    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/client/login`, {
        email,
        password,
      });
      const { access_token, refresh_token } = response.data;

      dispatch(login({ access_token, refresh_token }));
      showToast('Login successful!', 'success');
      router.replace('/(authenticated)/(tabs)');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      if (error.response?.data?.verification_required) {
        showToast(errorMessage, 'info');
        router.push(`/(auth)/verify?email=${encodeURIComponent(email)}`); // Redirect to verification screen
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
      buttonScale.value = withTiming(1, { duration: 200 });
    }
  };

  const googleAuth = async () => {
    try {
      setLoadingGAuth(true);

      const authUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/google-auth`;
      await axiosInstance.get(authUrl);

      // Handle successful authentication logic here
    } catch (error) {
      console.error('Google Login Error:', error);
    } finally {
      setLoadingGAuth(false);
    }
  };

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        {/* Logo and Title */}
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: theme.colors.primary }]}>🌿 AgriModel</Text>
          <Text style={[styles.tagline, { color: theme.colors.text }]}>{t('auth.login.welcome')}</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.login.email_label')}</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={t('auth.login.email_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.login.password_label')}</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={t('auth.login.password_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={passwordHidden}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setPasswordHidden(!passwordHidden)} style={styles.visibilityIcon}>
              <MaterialCommunityIcons name={passwordHidden ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <Link href="/forget" replace asChild>
          <TouchableOpacity>
            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
              {t('auth.login.forgot_password')}
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Login Button */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('auth.login.login')}</Text>}
          </TouchableOpacity>
        </Animated.View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: theme.colors.text }]}>{t('auth.login.signup_prompt')}</Text>
          <Link href="/signup" replace asChild>
            <TouchableOpacity>
              <Text style={[styles.signupLink, { color: theme.colors.primary }]}>{t('auth.login.signup_link')}</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Google Login Button */}
        <TouchableOpacity style={[styles.outlinedButton, { borderColor: theme.colors.accent }]} onPress={googleAuth}>
          <MaterialCommunityIcons name="google" size={24} color={theme.colors.text} />
          <Text style={[styles.outlinedButtonText, { color: theme.colors.text }]}>{t('auth.login.google_login')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignInScreen;
