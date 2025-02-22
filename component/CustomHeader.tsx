import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationsAsRead } from '@/redux/slices/notificationSlice';
import { useEffect } from 'react';

const CustomHeader = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();

  const handleNotification = async () => {
    try {
      router.push('/(authenticated)/notification');
      await dispatch(markNotificationsAsRead());
    } catch (error) {
      console.log(error);
    }
  };

  const { userDetails } = useSelector((state: any) => state.userDetails);
  const { notifications, hasFetched: hasFetchedNotification } = useSelector((state: any) => state.notifications);
  
    useEffect(() => {
      if (!hasFetchedNotification) {
        dispatch(fetchNotifications());
      }
    }, [dispatch, hasFetchedNotification]);

  return (
    <BlurView intensity={0} style={{ backgroundColor: theme.colors.background }}>
      <View
        style={[
          styles.container,
          {
            height: 80,
            gap: 10,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Link href={'/(authenticated)/(tabs)/profile'} asChild>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: userDetails?.profilePicture }}
              style={styles.profileImage}
            />
            <View>
              <Text style={[styles.greetingText, { color: theme.colors.text }]}>
                {t('home.greeting')}
              </Text>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {userDetails?.names}
              </Text>
            </View>
          </View>
        </Link>

        {/* Notification Bell with Badge */}
        <TouchableOpacity style={styles.notificationIcon} onPress={handleNotification}>
          <Feather name="bell" size={24} color={theme.colors.text} />
          {notifications.filter((notification: any) => !notification.isRead).length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{notifications.filter((notification: any) => !notification.isRead).length}</Text>
            </View>
          )}
        </TouchableOpacity>
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
    position: 'relative',
    padding: 5,
  },
  badgeContainer: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: 'red',
    width: 19,
    height: 19,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CustomHeader;
