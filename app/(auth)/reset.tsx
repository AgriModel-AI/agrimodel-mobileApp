import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/auth/globalStyles';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

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
        <TouchableOpacity
          onPress={() => router.replace('/success')}
          style={[globalStyles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={globalStyles.buttonText}>{t('auth.reset_password.continue')}</Text>
        </TouchableOpacity>
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
});
