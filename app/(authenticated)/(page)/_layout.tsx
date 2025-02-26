import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import 'react-native-reanimated';
import useSocket from '@/hooks/useSocket';


export default function Layout() {
  const { theme } = useTheme();
  useSocket();

  return (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen
          name="details"
          options={
            {
              headerShown: false,
            }
          }/>
        </Stack>
    )
  
}