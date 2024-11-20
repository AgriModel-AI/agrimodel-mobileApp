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
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/ThemeProvider';
import { Link, useRouter } from 'expo-router';
import { globalStyles as styles } from '@/styles/auth/globalStyles';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true); // Toggles password visibility
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const changeLanguage = () => {
    const currentLanguage = i18n.language;
    if (currentLanguage === 'en') {
      i18n.changeLanguage('fr'); // Switch to French
    } else if (currentLanguage === 'fr') {
      i18n.changeLanguage('rw'); // Switch to Kinyarwanda
    } else {
      i18n.changeLanguage('en'); // Switch back to English
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Logo */}
        <StatusBar translucent backgroundColor="transparent" barStyle={theme.dark ? 'light-content' : 'dark-content'} />
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: theme.colors.primary, fontFamily: 'Poppins_800ExtraBold' }]}>
            {t('auth.login.welcome')}
          </Text>
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

        {/* Forgot Password */}
        <Link href="/forget" replace asChild>
          <TouchableOpacity>
            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
              {t('auth.login.forgot_password')}
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/(tabs)')}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.buttonText}>{t('auth.login.login')}</Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: theme.colors.text }]}>{t('auth.login.signup_prompt')}</Text>
          <Link href="/signup" replace asChild>
            <TouchableOpacity>
              <Text style={[styles.signupLink, { color: theme.colors.primary }]}>{t('auth.login.signup_link')}</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* OR Divider */}
        <Text style={[styles.orText, { color: theme.colors.text }]}>{t('auth.login.or_text')}</Text>

        <TouchableOpacity
          onPress={() => console.log('Continue with Google')}
          style={[styles.outlinedButton, { borderColor: theme.colors.accent }]}
        >
          <MaterialCommunityIcons name="google" size={20} color={theme.colors.text} />
          <Text style={[styles.outlinedButtonText, { color: theme.colors.text }]}>{t('auth.login.google_login')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignInScreen;
