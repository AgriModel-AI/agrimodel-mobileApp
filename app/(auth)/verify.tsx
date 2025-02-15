import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/auth/globalStyles';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axiosInstance from '@/utils/axiosInstance';
import showToast from '@/component/showToast';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const VerificationScreen = ({ navigation }: { navigation: any }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const inputs = useRef<TextInput[]>([]);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { email } = useLocalSearchParams();

  const handleInputChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move focus to the next input
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && code[index] === '') {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');

    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });

    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/validate-code`, {
        email: email,
        code: verificationCode,
      });
      showToast('Verification successful', 'success');
      router.replace('/(auth)/success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      buttonScale.value = withTiming(1, { duration: 200 });
    }
  };

  const ResendCode = async () => {
    setResendLoading(true);
    setResendMessage('Wait, we are sending a new code...');
    setCode(['', '', '', '']); // Clear the code inputs

    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/resend-code`, {
        email: email,
      });
      showToast('Verification code resent successfully', 'success');
      setResendMessage(''); // Clear resend message
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      showToast(errorMessage, 'error');
      setResendMessage(''); // Clear resend message on error
    } finally {
      setResendLoading(false);
    }
  };

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[globalStyles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.replace('/login')}
          style={[styles.backToLogin]}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
          <Text style={[styles.backToLoginText, { color: theme.colors.primary }]}>
            {t('auth.verification.back_to_login')}
          </Text>
        </TouchableOpacity>

        {/* Logo and Title */}
        <View style={globalStyles.logoContainer}>
          <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
            {t('auth.verification.title')}
          </Text>
          <Text style={[globalStyles.subtitle, { color: theme.colors.text }]}>
            {t('auth.verification.description', { email: email })}
          </Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          {code.map((value, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el!)}
              style={[
                styles.input,
                { borderColor: theme.colors.primary, color: theme.colors.text },
              ]}
              value={value}
              onChangeText={(text) => handleInputChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') handleBackspace(index);
              }}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        {/* Verify Button */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code[3] === ''}
            style={[
              globalStyles.button,
              {
                backgroundColor: !(loading || code[3] === '')
                  ? theme.colors.primary
                  : theme.colors.primaryTransparent,
              },
            ]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>{t('auth.verification.verify')}</Text>}
          </TouchableOpacity>
        </Animated.View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          {resendLoading ? (
            <>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={[globalStyles.signupText, { color: theme.colors.text }]}>{resendMessage}</Text>
            </>
          ) : (
            <>
              <Text style={[globalStyles.signupText, { color: theme.colors.text }]}>
                {t('auth.verification.resend_prompt')}
              </Text>
              <TouchableOpacity onPress={ResendCode}>
                <Text style={[globalStyles.signupLink, { color: theme.colors.primary }]}>
                  {t('auth.verification.resend_code')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default VerificationScreen;

const styles = StyleSheet.create({
  backToLogin: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToLoginText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 1.5,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
