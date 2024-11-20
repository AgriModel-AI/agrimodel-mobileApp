import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

export const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgba(49, 123, 64, 1)',           // Primary color
    background: 'rgba(255, 255, 255, 1)',     // Light background
    surface: 'rgba(242, 241, 241, 1)',        // Surface color for cards/dialogs
    inputBackground: 'rgba(245, 245, 245, 1)', // Bright input background for clarity
    accent: 'rgba(83, 158, 246, 1)',          // Accent color
    text: 'rgba(0, 0, 0, 1)',                 // Dark text for readability
    placeholder: 'rgba(120, 120, 120, 1)',    // Mid-gray placeholder for contrast
    primaryTransparent: 'rgba(49, 123, 64, 0.2)',
    textInverted: 'rgba(220, 230, 240, 1)',  
  },
};



export const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: 'rgba(49, 123, 64, 1)',           // Primary color
    background: 'rgba(21, 32, 43, 1)',        // Soft black with blue undertones
    surface: 'rgba(30, 42, 54, 1)',           // Slightly lighter surface
    inputBackground: 'rgba(36, 48, 60, 1)',   // Subtle contrast for inputs
    accent: 'rgba(83, 158, 246, 1)',          // Accent color
    text: 'rgba(220, 230, 240, 1)',           // Soft white text
    placeholder: 'rgba(150, 150, 150, 1)',    // Placeholder text for inputs
    primaryTransparent: 'rgba(49, 123, 64, 0.2)', // Transparent primary
    textInverted: 'rgba(0, 0, 0, 1)', 
  },
};

