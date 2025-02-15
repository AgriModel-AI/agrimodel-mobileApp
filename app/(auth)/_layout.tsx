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
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="forget" />
          <Stack.Screen name="verify" />
          <Stack.Screen name="reset" />
          <Stack.Screen name="success" />
        </Stack>
      </SafeAreaView>
    )
  
}