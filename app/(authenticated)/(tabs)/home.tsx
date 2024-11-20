import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';

const Main = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>Dark Mode Example</Text>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          padding: 20,
          marginVertical: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: theme.colors.text }}>This is a surface</Text>
      </View>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
};

export default Main;
