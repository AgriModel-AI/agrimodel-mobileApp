import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/auth/globalStyles';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import showToast from '@/component/showToast';
import axiosInstance from '@/utils/axiosInstance';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [newPasswordHidden, setNewPasswordHidden] = useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!password) {
      showToast('Current Password is required.', 'info');
      return false;
    }

    if (!newPassword) {
      showToast('New Password is required.', 'info');
      return false;
    }
    if (!confirmPassword) {
      showToast('Confirm Password is required.', 'info');
      return false;
    }

    if (newPassword !== confirmPassword) {
      showToast('Password does not match', 'info');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    try {
      await axiosInstance.post("/user-details/password-change", {
        current_password: password,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast('Password Changed successfully', 'success');
      router.replace('/(auth)/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.description || 'An error occurred. Please try again.';
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

        {/* Back to Login */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Feather name="arrow-left" onPress={()=>router.back()} size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('profileChangePassword.page_title')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Logo and Title */}
        <View style={globalStyles.logoContainer}>
          <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
            {t('profileChangePassword.title')}
          </Text>
          <Text style={[globalStyles.subtitle, { color: theme.colors.text }]}>
            {t('profileChangePassword.description')}
          </Text>
        </View>

        {/* New Password Field */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('profileChangePassword.current_password_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('profileChangePassword.current_password_placeholder')}
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
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('profileChangePassword.password_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('profileChangePassword.password_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={newPasswordHidden}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setNewPasswordHidden(!newPasswordHidden)} style={globalStyles.visibilityIcon}>
              <MaterialCommunityIcons
                name={newPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Field */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('profileChangePassword.confirm_password_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('profileChangePassword.confirm_password_placeholder')}
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
        
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[globalStyles.button, { backgroundColor: theme.colors.primary, width: '100%' }]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('profileChangePassword.continue')}</Text>}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
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