import { useAppStateSync } from '@/hooks/useAppStateSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import TokenManager from '../services/storage/TokenManager';

export default function Index() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [hasTokens, setHasTokens] = useState<boolean>(false);

  useAppStateSync(hasTokens);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        
        if (hasCompletedOnboarding !== 'true') {
          setInitialRoute('/(onboarding)/welcome');
          return;
        }
        
        // Check if user is authenticated
        const hasToken = await TokenManager.hasTokens();
        setHasTokens(hasToken);
          
        if (hasToken) {
            setInitialRoute('/(authenticated)/(tabs)/home/');
          } else {
            setInitialRoute('/(auth)/login');
        }
      } catch (error) {
        console.error('Error determining initial route:', error);
        setInitialRoute('/(onboarding)/welcome');

      } finally {
        setIsLoading(false);
      }
    };
    
    checkInitialRoute();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Redirect href={initialRoute as any || '/(onboarding)/welcome'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});