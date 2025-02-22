import React, { useState } from 'react';
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
  Alert,
  Modal,
  FlatList,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import axiosInstance from '@/utils/axiosInstance';

interface ThemeType {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    text: string;
    inputBackground: string;
  };
}

interface UserDetails {
  profilePicture?: string;
  names?: string;
  email?: string;
}

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
  theme: ThemeType;
  t: (key: string) => string;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLanguage,
  onSelectLanguage,
  theme,
  t,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const currentLang = languages.find((lang) => lang.code === currentLanguage);

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

interface ProfileSectionProps {
  userDetails: UserDetails;
  theme: ThemeType;
  t: (key: string) => string;
  router: any;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  userDetails,
  theme,
  t,
  router,
}) => (
  <View style={styles.profileSection}>
    <View style={styles.profileHeader}>
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: userDetails?.profilePicture }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={[
            styles.editProfileIcon,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => router.push('/(authenticated)/(tabs)/profile/edit')}
        >
          <Feather name="edit-2" size={16} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfo}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {userDetails?.names || ''}
        </Text>
        <Text style={[styles.email, { color: theme.colors.text }]}>
          {userDetails?.email || ''}
        </Text>
      </View>
    </View>
  </View>
);

interface MenuCardProps {
  icon: React.ReactElement;
  title: string;
  rightElement?: React.ReactNode;
  color?: string | null;
  onPress?: () => void;
  theme: ThemeType;
}

const MenuCard: React.FC<MenuCardProps> = ({
  icon,
  title,
  rightElement,
  color = null,
  onPress,
  theme,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuContent}>
      {React.cloneElement(icon, { color: color || theme.colors.text })}
      <Text style={[styles.menuText, { color: color || theme.colors.text }]}>
        {title}
      </Text>
    </View>
    {rightElement}
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  const { userDetails } = useSelector((state: { userDetails: { userDetails: UserDetails } }) => state.userDetails);

  const handleBlockAccount = async () => {
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
            try {
              const response = await axiosInstance.patch('/user-details/block-account', {
                isBlocked: true,
              });
              if (response.status === 200) {
                router.replace('/(auth)/login');
              }
            } catch (error) {
              console.error('Error blocking account:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop:
            headerHeight + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 40),
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSection userDetails={userDetails} theme={theme} t={t} router={router} />

        <View style={styles.contentContainer}>
          {/* Settings Section */}
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.inputBackground },
            ]}
          >
            <MenuCard
              icon={<MaterialCommunityIcons name="theme-light-dark" size={22} />}
              title={t('profile.change_theme')}
              rightElement={
                <Switch
                  value={theme.dark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                  thumbColor={theme.colors.inputBackground}
                />
              }
              theme={theme}
            />
            <MenuCard
              icon={<MaterialCommunityIcons name="web" size={22} />}
              title={t('profile.change_language')}
              rightElement={
                <LanguageDropdown
                  currentLanguage={currentLanguage}
                  onSelectLanguage={(lang) => i18n.changeLanguage(lang)}
                  theme={theme}
                  t={t}
                />
              }
              theme={theme}
            />
          </View>

          {/* Account Section */}
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.inputBackground },
            ]}
          >
            <MenuCard
              icon={<Feather name="lock" size={22} />}
              title={t('profile.change_password')}
              rightElement={
                <Feather name="chevron-right" size={20} color={theme.colors.text} />
              }
              onPress={() =>
                router.push('/(authenticated)/(tabs)/profile/changePassword')
              }
              theme={theme}
            />
            <MenuCard
              icon={<Feather name="file-text" size={22} />}
              title={t('profile.terms_and_conditions')}
              rightElement={
                <Feather name="chevron-right" size={20} color={theme.colors.text} />
              }
              onPress={() => router.push('/(authenticated)/(tabs)/profile/terms')}
              theme={theme}
            />
            <MenuCard
              icon={<Feather name="help-circle" size={22} />}
              title={t('profile.help')}
              rightElement={
                <Feather name="chevron-right" size={20} color={theme.colors.text} />
              }
              onPress={() => router.push('/(authenticated)/(tabs)/profile/help')}
              theme={theme}
            />
          </View>

          {/* Danger Zone */}
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.inputBackground },
            ]}
          >
            <MenuCard
              icon={<MaterialIcons name="block" size={22} />}
              title={t('profile.block_account')}
              color="#ff6b6b"
              onPress={handleBlockAccount}
              theme={theme}
            />
            <MenuCard
              icon={<Feather name="log-out" size={22} />}
              title={t('profile.logout')}
              color="#ff6b6b"
              onPress={() => router.replace('/(auth)/login')}
              theme={theme}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editProfileIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    opacity: 0.8,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 15,
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

export default ProfileScreen;