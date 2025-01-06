import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Link, useRouter } from 'expo-router';

const ProfileScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  const changeLanguage = (lang: string | undefined) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: headerHeight + Platform.OS === 'android' ? StatusBar.currentHeight : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={[styles.name, { color: theme.colors.text }]}>
            Uwizeye Eddie
          </Text>
          <Text style={[styles.email, { color: theme.colors.text }]}>
            uwizeyeeddie@gmail.com
          </Text>
            <TouchableOpacity
              style={[
                styles.editProfileButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={()=> router.push('/(authenticated)/(tabs)/profile/edit')}
            >
              <Text
                style={[
                  styles.editProfileText,
                  { color: 'white' },
                ]}
              >
                {t('profile.edit_profile')}
              </Text>
            </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('profile.preferences')}
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.inputBackground }]}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceContent}>
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={24}
                color={theme.colors.text}
              />
              <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
                {t('profile.change_theme')}
              </Text>
            </View>
            <Switch
              value={theme.dark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.background }}
              thumbColor={theme.dark ? theme.colors.inputBackground : '#f4f3f4'}
              style={{padding: 0, marginVertical: -3}}
            />
          </View>
          <View style={[styles.divider]} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceContent}>
              <MaterialCommunityIcons
                name="web"
                size={24}
                color={theme.colors.text}
              />
              <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
                {t('profile.change_language')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                changeLanguage(
                  currentLanguage === 'en'
                    ? 'fr'
                    : currentLanguage === 'fr'
                    ? 'rw'
                    : 'en'
                )
              }
              style={styles.languageSwitcher}
            >
              <Text style={[styles.languageText, { color: theme.colors.text }]}>
                {currentLanguage.toUpperCase()}
              </Text>
              <Image
                source={
                  currentLanguage === 'en'
                    ? require('@/assets/flags/us.png')
                    : currentLanguage === 'fr'
                    ? require('@/assets/flags/fr.png')
                    : require('@/assets/flags/rw.png')
                }
                style={styles.flagIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 10 }]}>
          {t('profile.actions')}
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.inputBackground }]}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.preferenceContent}>
              <Feather name="lock" size={24} color={theme.colors.text} />
              <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
                {t('profile.change_password')}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={[styles.divider]} />
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.preferenceContent}>
              <Feather name="file-text" size={24} color={theme.colors.text} />
              <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
                {t('profile.terms_and_conditions')}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={[styles.divider]} />
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.preferenceContent}>
              <Feather name="log-out" size={24} color="red" />
              <Text style={[styles.preferenceText, { color: 'red' }]}>
                {t('profile.logout')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  email: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 32,
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16, // Increased border radius for the card
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 12,
  },
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
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
});
