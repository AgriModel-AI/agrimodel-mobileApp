import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';

const Main = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>
        Current Theme: {theme.dark ? 'Dark' : 'Light'}
      </Text>
      <Text style={{ color: theme.colors.primary }}>Primary Color</Text>
      <Text style={{ color: theme.colors.accent }}>Accent Color</Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
};

export default Main;
