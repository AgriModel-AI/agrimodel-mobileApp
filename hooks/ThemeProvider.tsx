import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider } from 'react-native-paper';
import { CustomLightTheme, CustomDarkTheme } from '@/constants/Colors';

type ThemeContextType = {
  theme: typeof CustomLightTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: CustomLightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const defaultTheme = systemScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme === 'dark' ? CustomDarkTheme : CustomLightTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === CustomLightTheme ? CustomDarkTheme : CustomLightTheme;
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme === CustomDarkTheme ? 'dark' : 'light')
      .catch(console.error);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
