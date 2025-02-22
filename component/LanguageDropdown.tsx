import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ImageSourcePropType,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: ImageSourcePropType;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: require('@/assets/flags/us.png'),
  },
  {
    code: 'fr',
    name: 'Français',
    flag: require('@/assets/flags/fr.png'),
  },
  {
    code: 'rw',
    name: 'Kinyarwanda',
    flag: require('@/assets/flags/rw.png'),
  },
];

interface LanguageDropdownProps {
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  const { theme } = useTheme();
  const { t } = useTranslation();

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        {
          backgroundColor:
            item.code === currentLanguage
              ? `${theme.colors.primary}20`
              : 'transparent',
        },
      ]}
      onPress={() => {
        onSelectLanguage(item.code);
        setIsVisible(false);
      }}
    >
      <Image source={item.flag} style={styles.flagIcon} />
      <Text
        style={[
          styles.languageName,
          {
            color: theme.colors.text,
            fontWeight: item.code === currentLanguage ? '600' : 'normal',
          },
        ]}
      >
        {item.name}
      </Text>
      {item.code === currentLanguage && (
        <Feather name="check" size={20} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.languageSwitcher}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.languageText, { color: theme.colors.text }]}>
          {currentLang?.code.toUpperCase()}
        </Text>
        <Image source={currentLang?.flag} style={styles.flagIcon} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              {t('profile.select_language')}
            </Text>
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default LanguageDropdown;

const styles = StyleSheet.create({
  languageSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    marginRight: 8,
  },
  flagIcon: {
    width: 24,
    height: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageList: {
    width: '100%',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  languageName: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
});