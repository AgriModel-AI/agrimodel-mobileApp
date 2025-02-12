import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons'; // Import Ionicons
import { router } from 'expo-router';

const notifications = [
  { id: '1', message: 'New update available for your crops.', date: 'Feb 12, 2025' },
  { id: '2', message: 'Rain is expected tomorrow.', date: 'Feb 11, 2025' },
  { id: '3', message: 'Community meeting scheduled for Friday.', date: 'Feb 10, 2025' },
];

const NotificationScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="arrow-left" onPress={()=>router.back()} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInRight.delay(index * 100)}
            exiting={FadeOutLeft}
            style={[styles.notificationItem, { backgroundColor: theme.colors.inputBackground }]}>
            <Feather name="bell" size={20} color={theme.colors.text} style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={[styles.message, { color: theme.colors.text }]}>{item.message}</Text>
              <Text style={[styles.date, { color: theme.colors.primary }]}>{item.date}</Text>
            </View>
          </Animated.View>
        )}
      />
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
});
