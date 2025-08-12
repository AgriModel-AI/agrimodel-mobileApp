// app/(profile)/language.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../contexts/ThemeContext';

// List of available languages
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
];

export default function LanguageScreen() {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  
  const changeLanguage = async (langCode: string) => {
    setSelectedLanguage(langCode);
    
    try {
      await i18n.changeLanguage(langCode);
      await AsyncStorage.setItem('user-language', langCode);
      
      // Success message
      Alert.alert(
        t('language.changed', 'Language Changed'),
        t('language.success_message', 'The application language has been changed successfully.')
      );
    } catch (error) {
      // console.error('Failed to change language:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('language.error_message', 'Failed to change language. Please try again.')
      );
    }
  };

  const renderItem = ({ item }: { item: typeof languages[0] }) => {
    const isSelected = selectedLanguage === item.code;
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && { backgroundColor: theme.colors.primary + '20' },
          { borderColor: theme.colors.border }
        ]}
        onPress={() => changeLanguage(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.languageFlag}>{item.flag}</Text>
          <Text style={[styles.languageName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
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
          {t('language.title', 'Language')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.info + '20' }]}>
            <Ionicons name="language" size={50} color={theme.colors.info} />
          </View>
        </View>
        
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {t('language.subtitle', 'Select your preferred language')}
        </Text>
        
        <FlatList
          data={languages}
          renderItem={renderItem}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContainer}
        />
      </View>
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
  contentContainer: {
    flex: 1,
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
    marginBottom: 30,
  },
  listContainer: {
    paddingBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
});