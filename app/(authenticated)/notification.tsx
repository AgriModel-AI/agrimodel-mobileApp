import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons'; 
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '@/redux/slices/notificationSlice';
import useRelativeTime from '@/hooks/useRelativeTime';

const NotificationScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const getRelativeTime = useRelativeTime();

  const { notifications, hasFetched: hasFetchedNotification } = useSelector((state: any) => state.notifications);

  useEffect(() => {
    if (!hasFetchedNotification) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, hasFetchedNotification]);

  // Animation for Empty State Icon
  const scale = useSharedValue(1);
  
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ), 
      -1, 
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('notifications')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={animatedStyle}>
            <Feather name="bell-off" size={40} color={theme.colors.text} />
          </Animated.View>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {t('no_notifications')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notificationId}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInRight.delay(index * 100)}
              exiting={FadeOutLeft}
              style={[styles.notificationItem, { backgroundColor: theme.colors.inputBackground }]}>
              <Feather name="bell" size={20} color={theme.colors.text} style={styles.icon} />
              <View style={styles.textContainer}>
                <Text style={[styles.message, { color: theme.colors.text }]}>{item.message}</Text>
                <Text style={[styles.date, { color: theme.colors.primary }]}>{getRelativeTime(item.timestamp)}</Text>
              </View>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    marginTop: 10,
  },
});
