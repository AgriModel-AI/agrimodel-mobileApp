import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/ThemeProvider';
import { Link, useRouter } from 'expo-router';
import { globalStyles as styles } from '@/styles/auth/globalStyles';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const buttonScale = useSharedValue(1);

  const handleLogin = async () => {
    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });
    setTimeout(() => {
      setLoading(false);
      router.replace('/(authenticated)/(tabs)');
      buttonScale.value = withTiming(1, { duration: 200 });
    }, 1500);
  };

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

       {/* Input Fields with Icons */}
       <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.login.email_label')}</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={t('auth.login.email_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={email}
              onChangeText={(text) => setEmail(text)}
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
              onChangeText={(text) => setPassword(text)}
            />
            <TouchableOpacity onPress={() => setPasswordHidden(!passwordHidden)} style={styles.visibilityIcon}>
              <MaterialCommunityIcons
                name={passwordHidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#888"
              />
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

        {/* Login Button with Animation */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.login.login')}</Text>
            )}
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
        <TouchableOpacity style={[styles.outlinedButton, { borderColor: theme.colors.accent }]}>
          <MaterialCommunityIcons name="google" size={24} color={theme.colors.text} />
          <Text style={[styles.outlinedButtonText, { color: theme.colors.text }]}>{t('auth.login.google_login')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignInScreen;
