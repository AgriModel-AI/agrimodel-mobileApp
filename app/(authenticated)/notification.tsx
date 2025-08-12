import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '@/contexts/ThemeContext';
import useRelativeTime from '@/hooks/useRelativeTime';
import { fetchNotifications, markNotificationsAsRead } from '@/redux/slices/notificationSlice';
import { useTranslation } from 'react-i18next';


export default function NotificationScreen() {
  const dispatch = useDispatch<any>();
  const { theme } = useTheme();
  const getRelativeTime = useRelativeTime();
  const { t } = useTranslation();

  const { notifications, loading, hasFetched } = useSelector((state: any) => state.notifications);

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, hasFetched]);

  const handleMarkAllAsRead = () => {
    dispatch(markNotificationsAsRead());
  };

  const renderItem = ({ item }: any) => {

    return (
      <View
        style={[
          styles.notificationCard,
          {
            backgroundColor: item.isRead ? theme.colors.card : theme.colors.primary + '10',
            borderLeftWidth: item.isRead ? 0 : 4,
            borderLeftColor: theme.colors.primary,
          },
        ]}
      >
        <Ionicons
          name={item.isRead ? 'notifications-outline' : 'notifications'}
          size={24}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.messageText, { color: theme.colors.text }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.accent }]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={[styles.markReadText, { color: theme.colors.primary }]}>{t('notifications.markAllAsRead', 'Mark all as read')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && !hasFetched ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notificationId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={theme.colors.border} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('notifications.empty', 'No notifications yet.')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  markReadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    opacity: 0.6,
  },
});
