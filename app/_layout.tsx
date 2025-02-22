import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as PaperProvider, useTheme } from '@/hooks/ThemeProvider';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useEffect, useCallback, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as NavigationBar from 'expo-navigation-bar';
import { useFonts, Poppins_100Thin, Poppins_200ExtraLight, Poppins_300Light, 
         Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, 
         Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black } from '@expo-google-fonts/poppins';
import { Platform, StatusBar, View } from 'react-native';
import { CommunityProvider } from '@/contexts/CommunityContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    async function loadLanguage() {
      try {
        const storedLang = await AsyncStorage.getItem('language');
        if (storedLang) {
          i18n.changeLanguage(storedLang);
        } else {
          i18n.changeLanguage('en');
        }
      } catch (error) {
        console.error('Error loading language from AsyncStorage:', error);
        i18n.changeLanguage('en');
      }
    }
    loadLanguage();
  }, []);


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
              <Toast />
            </GestureHandlerRootView>
            </CommunityProvider>
        </I18nextProvider>
      </PaperProvider>
    </Provider>
  );
}

function ThemedRootLayout() {
  const { theme } = useTheme();

  const segments = useSegments(); 
  const [isIndexScreen, setIsIndexScreen] = useState(false);

  useEffect(() => {
    // Whenever segments change, update isIndexScreen
    const checkIsIndexScreen = Number(segments.length) === 0;
    setIsIndexScreen(checkIsIndexScreen);
  }, [segments]); // This hook will re-run whenever `segments` changes
  
  useEffect(() => {
    const customizeSystemBars = async () => {
      // Always set the status bar to light on the index screen
      if (isIndexScreen) {
        StatusBar.setBarStyle('light-content', true);  // Force light status bar
      } else {
        StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content', true);
      }

      if (Platform.OS === 'android') {
        // Configure Android navigation bar
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync(theme.colors.background);

        if(isIndexScreen) {
          await NavigationBar.setButtonStyleAsync('light');
        }else{
          await NavigationBar.setButtonStyleAsync(theme.dark ? 'light' : 'dark');
        }
      }
    };

    customizeSystemBars();
  }, [theme, isIndexScreen]);

  return (
      <View style={{flex: 1}}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background, flex: 1 },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{
              headerShown: false,
              contentStyle: { flex: 1 },
            }}
          />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(authenticated)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
  );
  
}