import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as PaperProvider, useTheme } from '@/hooks/ThemeProvider';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import 'react-native-reanimated';

import {
  useFonts,
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useTheme();

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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider>
        <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
        <I18nextProvider i18n={i18n}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </I18nextProvider>
      </PaperProvider>
    </Provider>
  );
}