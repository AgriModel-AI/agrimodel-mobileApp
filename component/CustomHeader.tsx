import { Feather, Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

const CustomHeader = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <BlurView intensity={0} style={{backgroundColor: theme.colors.background, }}>
      <View
        style={[
          styles.container,
          {
            height: 80,
            gap: 10,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.background,
          },
        ]}>
        <Link href={'/(authenticated)/(tabs)/profile'} asChild>
          <View style={styles.profileContainer}>
            <Image
              source={require('@/assets/images/landing.jpg')}
              style={styles.profileImage}
            />
            <View>
              <Text style={[styles.greetingText, { color: theme.colors.text }]}>
                {t('home.greeting')}
              </Text>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                Uwizeye Eddie
              </Text>
            </View>
          </View>
        </Link>
        <Link href={'/(authenticated)/notification'} asChild>
          <TouchableOpacity style={styles.notificationIcon}>
            <Feather name="bell" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </Link>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  greetingText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  notificationIcon: {
    marginLeft: 16,
  },
});
export default CustomHeader;
