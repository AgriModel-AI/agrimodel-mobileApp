import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const { height } = Dimensions.get('window');

export default function VerifyEmail() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const { email } = useLocalSearchParams();

   const { 
    verifyCode, 
    isVerifyCodeLoading
  } = useAuth();
  
  const [code, setCode] = useState(['', '', '', '']);
  const [errors, setErrors] = useState({code: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0];
    }
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-advance to next input
    if (text !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { code: '' };

    // Code validation
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      newErrors.code = t('verify.invalidCode', 'Please enter a valid code');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

 const handleVerify = async () => {
    if (!validateForm()) return;
    
    const verificationCode = code.join('');
    setIsLoading(true);
    setGeneralError('');
    
    // Ensure email is a string
    const emailStr = Array.isArray(email) ? email[0] : email;

    try {
      await verifyCode(emailStr, verificationCode);
      // Navigation handled in the hook
    } catch (error: any) {
      // Handle error
      setGeneralError(error.message || t('errors.signupFailed'));
    }
  };

  const handleResend = () => {
    // Implement resend code logic
  };

  // Enhanced gradient colors
  const gradientColors: [string, string, string] = isDark 
    ? ['#121212', '#1E1E1E', '#232323'] 
    : ['#2E8B57', '#3B8C6E', '#4CAF50'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={gradientColors}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background decoration elements */}
        <View style={styles.decorationContainer}>
          <View style={[styles.decorationCircle, styles.decorationCircle1, { backgroundColor: `${theme.colors.primary}20` }]} />
          <View style={[styles.decorationCircle, styles.decorationCircle2, { backgroundColor: `${theme.colors.secondary}15` }]} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Animated.View 
            style={styles.iconContainer}
            entering={FadeInDown.duration(600).delay(200)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail-unread" size={40} color="#fff" />
            </View>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInUp.duration(800).delay(400)}
            style={[styles.card, { 
              backgroundColor: isDark ? `${theme.colors.card}95` : 'rgba(255, 255, 255, 0.15)',
              borderColor: `${theme.colors.border}30`,
              borderWidth: 1,
            }]}
          >
            <Text style={styles.title}>
              {t('verify.title', 'Verify Email')}
            </Text>
            
            <Text style={styles.subtitle}>
              {t('verify.subtitle', 'Enter your email and the verification code we sent you')}
            </Text>

            {generalError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color={theme.colors.danger} style={styles.errorIcon} />
                  <Text style={styles.errorText}>
                    {generalError}
                  </Text>
                </View>
              ) : null}
            
            <View style={styles.inputContainer}>
                            
              <Text style={styles.codeLabel}>
                {t('verify.verificationCode', 'Verification Code')}
              </Text>
              
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.codeInput,
                      digit ? styles.codeInputFilled : {},
                      { 
                        borderColor: errors.code ? theme.colors.danger : digit ? theme.colors.primary : 'rgba(255, 255, 255, 0.3)',
                        color: '#fff'
                      }
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
              
              {errors.code ? (
                <Text style={styles.errorText}>{errors.code}</Text>
              ) : null}
            </View>
            
            <LinearGradient
              colors={isDark ? [theme.colors.primary, theme.colors.secondary] : ['#fff', '#f8f8f8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Button
                title={t('verify.verifyButton', 'Verify Email')}
                onPress={handleVerify}
                loading={isLoading}
                disabled={isVerifyCodeLoading}
                style={styles.button}
                textStyle={{ 
                  color: isDark ? '#fff' : theme.colors.primary,
                  fontWeight: '600',
                  fontSize: 16
                }}
              />
            </LinearGradient>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                {t('verify.noCode', 'Didn\'t receive code?')}
              </Text>
              <TouchableOpacity 
                onPress={handleResend}
                activeOpacity={0.7}
              >
                <Text style={styles.resendButton}>
                  {t('verify.resend', 'Resend')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  decorationContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  decorationCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  decorationCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -50,
  },
  decorationCircle2: {
    width: 250,
    height: 250,
    bottom: height * 0.3,
    left: -100,
  },
  keyboardAvoidingView: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  card: {
    borderRadius: 24,
    padding: 28,
    backdropFilter: 'blur(10px)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    marginLeft: 4,
    color: '#fff',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  codeInputFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#ff5252',
    marginLeft: 4,
    marginTop: 4,
    fontSize: 12,
  },
  buttonGradient: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
  },
  resendButton: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 15,
  },
});