// app/(profile)/change-password.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useTheme } from '../../../../contexts/ThemeContext';
import TokenManager from '../../../../services/storage/TokenManager';
import axiosInstance from '../../../../utils/axiosInstance';

export default function ChangePasswordScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const insets = useSafeAreaInsets();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = t('validation.required', 'This field is required');
    }
    
    if (!newPassword) {
      newErrors.newPassword = t('validation.required', 'This field is required');
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('validation.password_length', 'Password must be at least 6 characters');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.required', 'This field is required');
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = t('validation.passwords_not_match', 'Passwords do not match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await axiosInstance.post("/user-details/password-change", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      
      Alert.alert(
        t('password.success', 'Success'),
        t('password.changed_successfully', 'Your password has been changed successfully. Please login again.'),
        [
          {
            text: 'OK',
            onPress: async () => {
              await TokenManager.clearTokens();
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    } catch (error: any) {
      const message = error.response?.data?.description || t('password.change_failed', 'Failed to change password');
      Alert.alert(t('common.error', 'Error'), message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('password.change_password', 'Change Password')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="lock-closed" size={50} color={theme.colors.primary} />
          </View>
        </View>
        
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {t('password.subtitle', 'Create a new password for your account')}
        </Text>
        
        <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
          <Input
            label={t('password.current', 'Current Password')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            placeholder={t('password.current_placeholder', 'Enter your current password')}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Ionicons 
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
            }
            error={errors.currentPassword}
          />
          
          <Input
            label={t('password.new', 'New Password')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            placeholder={t('password.new_placeholder', 'Enter your new password')}
            leftIcon={<Ionicons name="key-outline" size={20} color={theme.colors.text} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons 
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
            }
            error={errors.newPassword}
          />
          
          <Input
            label={t('password.confirm', 'Confirm New Password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder={t('password.confirm_placeholder', 'Confirm your new password')}
            leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.text} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons 
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
            }
            error={errors.confirmPassword}
          />
          
          <View style={styles.passwordRequirements}>
            <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>
              {t('password.requirements_title', 'Password must:')}
            </Text>
            
            <View style={styles.requirementItem}>
              <Ionicons 
                name={newPassword.length >= 6 ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={16} 
                color={newPassword.length >= 6 ? theme.colors.success : theme.colors.placeholder} 
              />
              <Text style={[
                styles.requirementText, 
                { color: newPassword.length >= 6 ? theme.colors.success : theme.colors.placeholder }
              ]}>
                {t('password.req_length', 'Be at least 6 characters long')}
              </Text>
            </View>
            
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={16} 
                color={/[A-Z]/.test(newPassword) ? theme.colors.success : theme.colors.placeholder} 
              />
              <Text style={[
                styles.requirementText, 
                { color: /[A-Z]/.test(newPassword) ? theme.colors.success : theme.colors.placeholder }
              ]}>
                {t('password.req_uppercase', 'Contain at least one uppercase letter')}
              </Text>
            </View>
            
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[0-9]/.test(newPassword) ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={16} 
                color={/[0-9]/.test(newPassword) ? theme.colors.success : theme.colors.placeholder} 
              />
              <Text style={[
                styles.requirementText, 
                { color: /[0-9]/.test(newPassword) ? theme.colors.success : theme.colors.placeholder }
              ]}>
                {t('password.req_number', 'Contain at least one number')}
              </Text>
            </View>
          </View>
          
          <Button
            title={t('password.update_button', 'Update Password')}
            onPress={handleChangePassword}
            loading={isLoading}
            style={styles.updateButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  formContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passwordRequirements: {
    marginTop: 16,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 13,
  },
  updateButton: {
    height: 50,
  },
});