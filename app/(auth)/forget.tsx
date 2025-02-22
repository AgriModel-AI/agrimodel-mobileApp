import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/auth/globalStyles';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import showToast from '@/component/showToast';
import axiosInstance from '@/utils/axiosInstance';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email) {
      showToast('Email is required.', 'info');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address.', 'info');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });

    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/password-reset`, {
        email,
      });
      showToast(response.data.message, 'success');
      router.push(`/(auth)/code?email=${encodeURIComponent(email)}`); // Redirect to verification screen
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
        showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      buttonScale.value = withTiming(1, { duration: 200 });
    }
  };

  const buttonScale = useSharedValue(1);
  
    const animatedButtonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonScale.value }],
    }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>

        {/* Back to Login and Cancel */}
        <View style={styles.backContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              {t('auth.verification.back_to_login')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logo and Title */}
        <View style={globalStyles.logoContainer}>
          <MaterialCommunityIcons name="lock-question" size={80} color={theme.colors.text} />
          <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
            {t('auth.forgot_password.title')}
          </Text>
          <Text style={[globalStyles.subtitle, { color: theme.colors.text }]}>
            {t('auth.forgot_password.description')}
          </Text>
        </View>

        {/* Input Field */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.forgot_password.email_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#888" style={globalStyles.icon} />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.forgot_password.email_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Continue Button */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[globalStyles.button, { backgroundColor: theme.colors.primary }]}
          >
             {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('auth.forgot_password.continue')}</Text> }
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  backContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
});
