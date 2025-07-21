// app/(profile)/terms.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../../contexts/ThemeContext';

export default function TermsScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const insets = useSafeAreaInsets();
  
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
          {t('terms.title', 'Terms & Conditions')}
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
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.info + '20' }]}>
            <Ionicons name="document-text" size={50} color={theme.colors.info} />
          </View>
        </View>
        
        <Text style={[styles.lastUpdated, { color: theme.colors.placeholder }]}>
          {t('terms.last_updated', 'Last Updated')}: June 15, 2023
        </Text>
        
        <View style={[styles.termsContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section1_title', '1. Introduction')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section1_content', 'Welcome to AgriModel. These Terms & Conditions govern your use of our mobile application and services. By using our application, you agree to these terms in full.')}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section2_title', '2. Definitions')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section2_content', '"App" refers to AgriModel mobile application.\n"User" refers to any individual who accesses or uses the App.\n"Content" refers to any information, data, text, graphics, or other materials displayed on the App.')}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section3_title', '3. User Accounts')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section3_content', '3.1 To use certain features of the App, you may need to create a user account.\n3.2 You are responsible for maintaining the confidentiality of your account credentials.\n3.3 You agree to provide accurate and complete information when creating your account.\n3.4 You are solely responsible for all activities that occur under your account.')}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section4_title', '4. Privacy Policy')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section4_content', 'Our Privacy Policy describes how we handle the information you provide to us when you use our App. By using the App, you agree that we can collect, use, and share your information in accordance with our Privacy Policy.')}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section5_title', '5. User Conduct')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section5_content', 'You agree not to use the App to:\n5.1 Violate any applicable laws or regulations.\n5.2 Infringe the rights of others.\n5.3 Transmit any material that is harmful, offensive, or otherwise objectionable.\n5.4 Interfere with or disrupt the App or servers or networks connected to the App.\n5.5 Attempt to gain unauthorized access to any part of the App.')}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section6_title', '6. Intellectual Property')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section6_content', '6.1 The App and its content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.\n6.2 You may not copy, modify, create derivative works, publicly display, publicly perform, republish, download, or distribute any portion of the App without our prior written consent.')}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section7_title', '7. Changes to Terms')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section7_content', 'We reserve the right to modify these Terms at any time. If we make changes, we will notify you by revising the date at the top of these Terms and, in some cases, we may provide you with additional notice. Your continued use of the App after the changes have been made will constitute your acceptance of the changes.')}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('terms.section8_title', '8. Contact Information')}
          </Text>
          <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
            {t('terms.section8_content', 'If you have any questions about these Terms, please contact us at:\nEmail: support@agrimodel.rw\nPhone: +250 7XX XXX XXX')}
          </Text>
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
  lastUpdated: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  termsContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
});