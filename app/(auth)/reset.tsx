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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import showToast from '@/component/showToast';
import axiosInstance from '@/utils/axiosInstance';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { email, code }: any = useLocalSearchParams();

  const validateInputs = () => {
    if (!password) {
      showToast('Password is required.', 'info');
      return false;
    }
    if (!confirmPassword) {
      showToast('Confirm Password is required.', 'info');
      return false;
    }

    if (password !== confirmPassword) {
      showToast('Password does not match', 'info');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    try {
      await axiosInstance.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/password-reset/verify`, {
        email,
        token: code,
        new_password: password,
        confirm_password: confirmPassword,
      });
      showToast('Successful', 'success');
      router.replace('/(auth)/success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      if (error.response?.data?.invalid_code) {
        showToast(errorMessage, 'info');
        router.back(); // Redirect to verification screen
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>

        {/* Back to Login */}
        <View style={styles.backContainer}>
          <TouchableOpacity
            onPress={() => router.replace('/login')}
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
          <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
            {t('auth.reset_password.title')}
          </Text>
          <Text style={[globalStyles.subtitle, { color: theme.colors.text }]}>
            {t('auth.reset_password.description')}
          </Text>
        </View>

        {/* New Password Field */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.signup.password_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.signup.password_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={passwordHidden}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setPasswordHidden(!passwordHidden)} style={globalStyles.visibilityIcon}>
              <MaterialCommunityIcons
                name={passwordHidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Field */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.signup.confirm_password_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.signup.confirm_password_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={confirmPasswordHidden}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setConfirmPasswordHidden(!confirmPasswordHidden)}
              style={globalStyles.visibilityIcon}
            >
              <MaterialCommunityIcons
                name={confirmPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        
        <View style={styles.buttonContainer}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()} // Going back to the previous screen
            style={[styles.button, { backgroundColor: theme.colors.surface, width: '35%' }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.primary} />
            <Text style={[globalStyles.buttonText, {color: theme.colors.primary}]}>
              {t('auth.verification.back')}
            </Text>
          </TouchableOpacity>

          {/* Continue Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[globalStyles.button, { backgroundColor: theme.colors.primary, width: '60%' }]}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('auth.reset_password.continue')}</Text>}
            </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ResetPasswordScreen;

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
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_400Regular',
    color: 'white',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    marginVertical: 10,
  },
});