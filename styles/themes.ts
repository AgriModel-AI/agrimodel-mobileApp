import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    secondary: string;
    accent: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    placeholder: string;
    disabled: string;
  };
}

export const LightTheme: Theme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: '#3B8C6E',
    secondary: '#4CAF50',
    accent: '#FF9800',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212121',
    border: '#DADADA',
    notification: '#F44336',
    success: '#4CAF50',
    danger: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
    placeholder: '#9E9E9E',
    disabled: '#BDBDBD',
  },
};

export const DarkTheme: Theme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#4ECB71',
    secondary: '#388E3C',
    accent: '#FFA726',
    background: '#121212',
    card: '#1E1E1E',
    text: '#F5F5F5',
    border: '#333333',
    notification: '#FF5252',
    success: '#66BB6A',
    danger: '#EF5350',
    warning: '#FFCA28',
    info: '#42A5F5',
    placeholder: '#757575',
    disabled: '#616161',
  },
};
