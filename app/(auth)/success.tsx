import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/auth/globalStyles';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

const SuccessScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>

      {/* Icon and Title */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle-outline" size={80} color={theme.colors.primary} />
        </View>
        <Text style={[globalStyles.title, { color: theme.colors.primary, marginTop: 20 }]}>
          {t('auth.success.title')}
        </Text>
        <Text style={[globalStyles.subtitle, { color: theme.colors.text, marginTop: 10 }]}>
          {t('auth.success.description')}
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={() => router.replace('/login')}
        style={[globalStyles.button, { backgroundColor: theme.colors.primary, marginTop: 40 }]}
      >
        <Text style={globalStyles.buttonText}>{t('auth.success.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
