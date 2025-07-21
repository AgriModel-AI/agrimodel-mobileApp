// app/(profile)/block-account.tsx
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../../components/ui/Button';
import { useTheme } from '../../../../contexts/ThemeContext';
import TokenManager from '../../../../services/storage/TokenManager';
import axiosInstance from '../../../../utils/axiosInstance';

export default function BlockAccountScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  


  const blockAccount = async () => {
      Alert.alert(
          t('profile.blockAccountConfirmation.title'),
      t('profile.blockAccountConfirmation.description'),
      [
        {
          text: t('profile.blockAccountConfirmation.cancel'),
          style: 'cancel',
        },
        {
            text: t('profile.blockAccountConfirmation.confirm'),
            onPress: async () => {
            setIsLoading(true);
            try {
              const response = await axiosInstance.patch('/user-details/block-account', {
                isBlocked: true,
              });
              if (response.status === 200) {
                await TokenManager.clearTokens();
                setIsLoading(false);
                router.replace('/(auth)/login');
              }
            } catch (error:any) {
              const message = error.response?.data?.message || t('block_account.error_message', 'Failed to block account. Please try again.');
              Alert.alert(t('common.error', 'Error'), message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
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
          {t('block_account.title', 'Block Account')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.danger + '20' }]}>
            <Ionicons name="shield-half" size={50} color={theme.colors.danger} />
          </View>
        </View>
        
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={24} color={theme.colors.danger} style={styles.warningIcon} />
          <Text style={[styles.warningTitle, { color: theme.colors.danger }]}>
            {t('block_account.warning_title', 'Warning')}
          </Text>
          <Text style={[styles.warningText, { color: theme.colors.text }]}>
            {t('block_account.warning_text', 'Blocking your account will prevent you from accessing the app and your data until you contact our support team to unblock it.')}
          </Text>
        </View>
        
        <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('block_account.reason_title', 'Please tell us why you want to block your account')}
          </Text>
          
          
          
          <Button
            title={t('block_account.block_button', 'Block My Account')}
            onPress={blockAccount}
            loading={isLoading}
            style={[styles.blockButton, { backgroundColor: theme.colors.danger }]}
          />
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
              {t('common.cancel', 'Cancel')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.supportContainer}>
          <Text style={[styles.supportText, { color: theme.colors.text }]}>
            {t('block_account.need_help', 'Need help? Contact our support team')}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(authenticated)/(tabs)/profile/help')}
          >
            <Text style={[styles.supportLink, { color: theme.colors.primary }]}>
              {t('block_account.contact_support', 'Contact Support')}
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
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
  warningContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIcon: {
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  formContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    height: 120,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    height: 50,
  },
  blockButton: {
    marginTop: 24,
    height: 50,
  },
  cancelButton: {
    marginTop: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  supportContainer: {
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    marginBottom: 8,
  },
  supportLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});