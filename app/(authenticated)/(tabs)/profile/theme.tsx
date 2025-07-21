// app/(profile)/theme.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../contexts/ThemeContext';

export default function ThemeScreen() {
  const { theme, isDark, setThemeMode, themeMode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
    try {
      await AsyncStorage.setItem('theme-mode', mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('theme.title', 'Theme')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { 
            backgroundColor: isDark ? '#ffffff20' : '#00000020' 
          }]}>
            <Ionicons 
              name={isDark ? "moon" : "sunny"} 
              size={50} 
              color={isDark ? "#fff" : "#FF9800"} 
            />
          </View>
        </View>
        
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {t('theme.subtitle', 'Choose your preferred appearance')}
        </Text>
        
        <View style={[styles.optionsContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.themeOption}>
            <View style={styles.optionTextContainer}>
              <Ionicons name="sunny-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {t('theme.light', 'Light')}
              </Text>
            </View>
            <View style={[
              styles.radioButton, 
              themeMode === 'light' && { borderColor: theme.colors.primary }
            ]}>
              {themeMode === 'light' && (
                <View style={[styles.radioButtonSelected, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <TouchableOpacity 
              style={styles.radioTouchable}
              onPress={() => handleThemeChange('light')}
            />
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          <View style={styles.themeOption}>
            <View style={styles.optionTextContainer}>
              <Ionicons name="moon-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {t('theme.dark', 'Dark')}
              </Text>
            </View>
            <View style={[
              styles.radioButton, 
              themeMode === 'dark' && { borderColor: theme.colors.primary }
            ]}>
              {themeMode === 'dark' && (
                <View style={[styles.radioButtonSelected, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <TouchableOpacity 
              style={styles.radioTouchable}
              onPress={() => handleThemeChange('dark')}
            />
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          <View style={styles.themeOption}>
            <View style={styles.optionTextContainer}>
              <Ionicons name="phone-portrait-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {t('theme.system', 'System Default')}
              </Text>
            </View>
            <View style={[
              styles.radioButton, 
              themeMode === 'system' && { borderColor: theme.colors.primary }
            ]}>
              {themeMode === 'system' && (
                <View style={[styles.radioButtonSelected, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <TouchableOpacity 
              style={styles.radioTouchable}
              onPress={() => handleThemeChange('system')}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
  },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    position: 'relative',
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  radioTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  }
});