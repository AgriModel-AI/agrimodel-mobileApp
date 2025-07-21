// components/home/QuickActions.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface QuickActionProps {
  onDiagnosisPress: () => void;
  onExplorePress: () => void;
  onCommunityPress: () => void;
}

export const QuickActions: React.FC<QuickActionProps> = ({
  onDiagnosisPress,
  onExplorePress,
  onCommunityPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const actions = [
    {
      id: 'diagnosis',
      icon: 'leaf',
      label: t('home.diagnose'),
      onPress: onDiagnosisPress,
      color: theme.colors.primary,
    },
    {
      id: 'explore',
      icon: 'compass',
      label: t('home.explore'),
      onPress: onExplorePress,
      color: theme.colors.accent,
    },
    {
      id: 'community',
      icon: 'people',
      label: t('home.community'),
      onPress: onCommunityPress,
      color: theme.colors.secondary,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${action.color}20` },
            ]}
          >
            <Ionicons name={action.icon as any} size={24} color={action.color} />
          </View>
          <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});