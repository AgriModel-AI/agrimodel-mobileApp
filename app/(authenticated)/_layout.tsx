import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Layout() {
  const { theme } = useTheme();

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="notification" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="(modals)/community" 
            options={{
              presentation: 'modal',
              animation: 'fade_from_bottom',
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaView>
    )
  
}