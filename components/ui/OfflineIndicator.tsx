// components/ui/OfflineIndicator.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineIndicator: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, opacity]);

  if (isConnected) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.danger, opacity }
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{t('offline.indicator')}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});