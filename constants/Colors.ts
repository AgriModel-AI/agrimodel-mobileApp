import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

export const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgba(49, 123, 64, 1)',          // Primary color
    background: 'rgba(245, 245, 245, 1)',    // Light background
    surface: 'rgba(242, 241, 241, 1)',       // Surface color
    accent: 'rgba(83, 158, 246, 1)',         // Accent color
    text: 'rgba(0, 0, 0, 1)',                // Dark text
    primaryTransparent: 'rgba(49, 123, 64, 0.2)', // Transparent primary
  },
};


export const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: 'rgba(49, 123, 64, 1)',           // Primary color
    background: 'rgba(18, 18, 18, 1)',        // Softer dark background
    surface: 'rgba(34, 34, 34, 1)',           // Surface color for cards, dialogs, etc.
    accent: 'rgba(83, 158, 246, 1)',          // Accent color
    text: 'rgba(245, 245, 245, 1)',           // Light text color
    primaryTransparent: 'rgba(49, 123, 64, 0.2)', // Transparent primary
  },
};

