import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as PaperProvider, useTheme } from '@/hooks/ThemeProvider';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useEffect, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as NavigationBar from 'expo-navigation-bar';
import { useFonts, Poppins_100Thin, Poppins_200ExtraLight, Poppins_300Light, 
         Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, 
         Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black } from '@expo-google-fonts/poppins';
import { Platform, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommunityProvider } from '@/contexts/CommunityContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  let [loaded] = useFonts({
    Poppins_100Thin,
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider>
        <I18nextProvider i18n={i18n}>
          <CommunityProvider>
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <ThemedRootLayout />
            </GestureHandlerRootView>
            </CommunityProvider>
        </I18nextProvider>
      </PaperProvider>
    </Provider>
  );
}

function ThemedRootLayout() {
  const { theme } = useTheme();

  useEffect(() => {
    const customizeSystemBars = async () => {
      if (Platform.OS === 'android') {
        // Configure Android navigation bar
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync(theme.colors.background);
        await NavigationBar.setButtonStyleAsync(theme.dark ? 'light' : 'dark');
      } else if (Platform.OS === 'ios') {
        // For iOS, we can only control the status bar style
        // The home indicator will automatically adapt to light/dark based on background
        StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content', true);
      }
    };

    customizeSystemBars();
  }, [theme]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
      />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}>
        <Stack.Screen name="index" 
          options={{
            headerShown: false,
            contentStyle: { flex: 1 }, // No SafeAreaView effect
          }}
        />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="forget" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="reset" />
        <Stack.Screen name="success" />
        <Stack.Screen name="(authenticated)/notification" />
        <Stack.Screen name="(authenticated)/(tabs)" />
        <Stack.Screen name="(authenticated)/(modals)/community" 
          options={{
            presentation: 'containedModal',
            animation: 'fade',
            headerShown: true,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaView>
  );
}