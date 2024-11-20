import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TermsScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // Ensure content is parsed as an array
  const termsContent = t('terms.content', { returnObjects: true }) as Array<{
    header: string;
    text: string;
  }>;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('terms.title')}</Text>
        <TouchableOpacity onPress={() => router.replace('/signup')}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>{t('terms.subtitle')}</Text>
        <Text style={[styles.lastRevised, { color: theme.colors.text }]}>
          {t('terms.last_revised')} {t('terms.last_revised_date')}
        </Text>

        {termsContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>{section.header}</Text>
            <Text style={[styles.sectionText, { color: theme.colors.text }]}>{section.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_800ExtraBold',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 10,
  },
  lastRevised: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: 'Poppins_800ExtraBold',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 22,
  },
});
