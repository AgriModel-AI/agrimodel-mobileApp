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

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar translucent backgroundColor="transparent" barStyle={theme.dark ? 'light-content' : 'dark-content'} />

        {/* Back to Login and Cancel */}
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
        <TouchableOpacity
          onPress={() => router.replace('/verify')}
          style={[globalStyles.button, { backgroundColor: theme.colors.primary }]}
        >
            <Text style={globalStyles.buttonText}>{t('auth.forgot_password.continue')}</Text>
        </TouchableOpacity>
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
