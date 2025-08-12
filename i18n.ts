import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en.json';
import fr from './locales/fr.json';
import rw from './locales/rw.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  rw: { translation: rw },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get stored language
      const storedLang = await AsyncStorage.getItem('userLanguage');
      
      if (storedLang) {
        return callback(storedLang);
      }
      
      // If no stored language, use device locale
      const deviceLocale = Localization.locale.split('-')[0];
      
      // Check if we support this language
      if (Object.keys(resources).includes(deviceLocale)) {
        return callback(deviceLocale);
      }
      
      // Default to English
      return callback('en');
    } catch (error) {
      // console.error('Error detecting language:', error);
      callback('en');
    }
  },
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('userLanguage', lng);
    } catch (error) {
      // console.error('Error caching language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;