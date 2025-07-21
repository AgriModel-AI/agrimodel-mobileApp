// app/(authenticated)/explore/webview.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { isConnected } = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {title || t('explore.webView')}
        </Text>
        
        <View style={styles.placeholder} />
      </View>
      
      {!isConnected ? (
        <View style={styles.offlineContainer}>
          <Ionicons name="cloud-offline-outline" size={50} color={theme.colors.danger} />
          <Text style={[styles.offlineText, { color: theme.colors.text }]}>
            {t('explore.offlineWebViewMessage')}
          </Text>
        </View>
      ) : (
        <>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          
          <WebView
            source={{ uri: url as string }}
            style={styles.webView}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
        </>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 32,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});