import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import fr from './locales/fr.json';
import rw from './locales/rw.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      rw: { translation: rw }
    },
    lng: Localization.locale.split('-')[0], // Detect the device language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;