import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/ThemeProvider';
import { Link, useRouter } from 'expo-router';
import { globalStyles } from '@/styles/auth/globalStyles';
import axiosInstance from '@/utils/axiosInstance';
import showToast from '@/component/showToast';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const SignupScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone_number] = useState('+250'); // Default value for phone number
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true); // For password field
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true); // For confirm password field
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const handleInputChange = (setter: (arg0: any) => void) => (value: string) => {
    setter(value.trim());
  };

  const validateInputs = () => {
    if (!username) {
      showToast('Username is required.', 'info');
      return false;
    }

    if (username.length < 3) {
      showToast('Username should be at least 3 characters long.', 'info');
      return false;
    }

    if (!email) {
      showToast('Email is required.', 'info');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address.', 'info');
      return false;
    }

    if (!phone_number) {
      showToast('Phone number is required.', 'info');
      return false;
    }

    const phoneNumberRegex = /^\+250\d{9}$/;
    if (!phoneNumberRegex.test(phone_number)) {
      showToast('Please enter a valid phone number starting with +250.', 'info');
      return false;
    }

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

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });

    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/signup`,
        {
          email,
          username,
          password,
          phone_number
        }
      );
      showToast(response.data.message, 'success');
      router.push(`/(auth)/verify?email=${encodeURIComponent(email)}`);
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
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[globalStyles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Fixed Title */}
        <View style={[globalStyles.logoContainer, { marginTop: 10 }]}>
          <Text style={[globalStyles.appName, { color: theme.colors.primary }]}>🌿 AgriModel</Text>
          <Text style={[globalStyles.tagline, { color: theme.colors.text }]}>{t('auth.login.welcome')}</Text>
        </View>

        {/* Scrollable Form */}
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
          {/* Username */}
          <View style={globalStyles.inputGroup}>
            <Text style={[globalStyles.label, { color: theme.colors.text }]}>
              {t('auth.signup.names_label')}
            </Text>
            <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#888" />
              <TextInput
                style={[globalStyles.input, { color: theme.colors.text }]}
                placeholder={t('auth.signup.names_placeholder')}
                placeholderTextColor={theme.colors.placeholder}
                value={username}
                onChangeText={handleInputChange(setUsername)} // Removed spaces here
              />
            </View>
          </View>

          {/* Email */}
          <View style={globalStyles.inputGroup}>
            <Text style={[globalStyles.label, { color: theme.colors.text }]}>
              {t('auth.signup.email_label')}
            </Text>
            <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#888" />
              <TextInput
                style={[globalStyles.input, { color: theme.colors.text }]}
                placeholder={t('auth.signup.email_placeholder')}
                placeholderTextColor={theme.colors.placeholder}
                value={email}
                onChangeText={handleInputChange(setEmail)} // Removed spaces here
              />
            </View>
          </View>

          {/* Phone */}
          <View style={globalStyles.inputGroup}>
            <Text style={[globalStyles.label, { color: theme.colors.text }]}>
              {t('auth.signup.phone_label')}
            </Text>
            <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
              <MaterialCommunityIcons name="phone-outline" size={20} color="#888" />
              <TextInput
                style={[globalStyles.input, { color: theme.colors.text }]}
                placeholder={t('auth.signup.phone_placeholder')}
                placeholderTextColor={theme.colors.placeholder}
                value={phone_number}
                onChangeText={handleInputChange(setPhone_number)} // Removed spaces here
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
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
                onChangeText={handleInputChange(setPassword)} // Removed spaces here
              />
              <TouchableOpacity onPress={() => setPasswordHidden(!passwordHidden)} style={globalStyles.visibilityIcon}>
                <MaterialCommunityIcons name={passwordHidden ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
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
                onChangeText={handleInputChange(setConfirmPassword)} // Removed spaces here
              />
              <TouchableOpacity onPress={() => setConfirmPasswordHidden(!confirmPasswordHidden)} style={globalStyles.visibilityIcon}>
                <MaterialCommunityIcons name={confirmPasswordHidden ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Conditions */}
          <View style={[globalStyles.termsText, { justifyContent: 'center' }]}>
            <TouchableOpacity
              onPress={() => setAgreeTerms(!agreeTerms)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              {agreeTerms && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
            <Text style={globalStyles.termsLabel}>
              {t('auth.signup.agree_terms')}{' '}
              <Link href={'/terms'} asChild style={[globalStyles.link]}>
                <Text style={[globalStyles.link]}>{t('auth.signup.terms_and_conditions')}</Text>
              </Link>
            </Text>
          </View>

          {/* Signup Button */}
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              onPress={handleSignup}
              disabled={!agreeTerms}
              style={[
                globalStyles.button,
                {
                  backgroundColor: agreeTerms ? theme.colors.primary : theme.colors.primaryTransparent,
                },
              ]}
            >
              {loading ? <ActivityIndicator color="#fff" /> :
                <Text style={globalStyles.buttonText}>{t('auth.signup.create_account')}</Text>
              }
            </TouchableOpacity>
          </Animated.View>

          {/* Already have an account */}
          <View style={globalStyles.signupContainer}>
            <Text style={[globalStyles.signupText, { color: theme.colors.text }]}>
              {t('auth.signup.already_have_account')}
            </Text>
            <Link href="/login" replace asChild>
              <TouchableOpacity>
                <Text style={[globalStyles.signupLink, { color: theme.colors.primary }]}>{t('auth.signup.login_link')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
