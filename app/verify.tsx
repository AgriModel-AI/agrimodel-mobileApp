import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/auth/globalStyles';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const VerificationScreen = ({ navigation }: { navigation: any }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<TextInput[]>([]);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

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

  const handleVerify = () => {
    console.log('Verification code:', code.join(''));
  };

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
            {t('auth.verification.description', { email: 'example@example.com' })}
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
        <TouchableOpacity
          onPress={() => router.replace('/reset')}
          style={[globalStyles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={globalStyles.buttonText}>{t('auth.verification.verify')}</Text>
        </TouchableOpacity>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={[globalStyles.signupText, { color: theme.colors.text }]}>
            {t('auth.verification.resend_prompt')}
          </Text>
          <TouchableOpacity onPress={() => console.log('Resend code')}>
            <Text style={[globalStyles.signupLink, { color: theme.colors.primary }]}>
              {t('auth.verification.resend_code')}
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row' as 'row',
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
    flexDirection: 'row' as 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
