import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
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

export default function VerificationCode() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { resendCode, isResendCodeLoading } = useAuth();
  
  // Get email from params
  
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Add cooldown for resend
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const { email }: any = useLocalSearchParams();


  const startCooldownTimer = () => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    
    cooldownTimerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

  const validateCode = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError(t('code.invalidCode', 'Please enter a valid code'));
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCode()) return;
    
    setIsLoading(true);
    
    try {
      // For password reset flow - navigate to reset page with params
      const verificationCode = code.join('');
      router.push(`/(auth)/reset?email=${encodeURIComponent(email)}&code=${encodeURIComponent(verificationCode)}`);
    } catch (err: any) {
      setError(err.message || t('errors.requestFailed', 'Request failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResendCodeLoading) return;
    
    try {
      await resendCode(email);
      
      // Start cooldown
      setCooldown(60);
      startCooldownTimer();
      
      // Show success message
      Alert.alert(
        t('code.resendSuccess', 'Code Sent'),
        t('code.resendSuccessMessage', 'A new verification code has been sent to your email.')
      );
    } catch (error: any) {
      Alert.alert(
        t('code.resendError', 'Error'),
        error.message || t('code.resendErrorMessage', 'Failed to resend code. Please try again.')
      );
    }
  };

  // Enhanced gradient colors
  const gradientColors: [string, string, ...string[]] = isDark 
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
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Animated.View 
            style={styles.iconContainer}
            entering={FadeInDown.duration(600).delay(200)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={40} color="#fff" />
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
              {t('code.title', 'Enter Verification Code')}
            </Text>
            
            <Text style={styles.subtitle}>
              {t('code.subtitle', 'We\'ve sent a 4-digit code to your email. Please enter it below.')}
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
                      borderColor: error ? theme.colors.danger : digit ? theme.colors.primary : 'rgba(255, 255, 255, 0.3)',
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
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            
            <LinearGradient
              colors={isDark ? [theme.colors.primary, theme.colors.secondary] : ['#fff', '#f8f8f8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Button
                title={t('code.verifyButton', 'Verify Code')}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
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
                {t('code.noCode', 'Didn\'t receive code?')}
              </Text>
              <TouchableOpacity 
                onPress={handleResend}
                activeOpacity={0.7}
                disabled={cooldown > 0 || isResendCodeLoading}
              >
                <Text style={[
                  styles.resendButton,
                  (cooldown > 0 || isResendCodeLoading) ? styles.resendButtonDisabled : {}
                ]}>
                  {cooldown > 0 
                    ? `${t('code.resend', 'Resend')} (${cooldown}s)` 
                    : isResendCodeLoading 
                      ? t('code.sending', 'Sending...') 
                      : t('code.resend', 'Resend')}
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
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
  errorText: {
    color: '#ff5252',
    textAlign: 'center',
    marginBottom: 20,
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
  resendButtonDisabled: {
    opacity: 0.5,
  },
});