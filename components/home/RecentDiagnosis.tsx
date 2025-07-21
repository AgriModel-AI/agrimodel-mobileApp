// components/home/RecentDiagnosis.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../hooks/useLanguage';
import { DiagnosisResult } from '../../services/api/diagnosisService';
import { DiagnosisCard } from '../diagnosis/DiagnosisCard';

interface RecentDiagnosisProps {
  diagnoses: DiagnosisResult[];
  loading: boolean;
  onViewAll: () => void;
  onItemPress: (id: string) => void;
}

export const RecentDiagnosis: React.FC<RecentDiagnosisProps> = ({
  diagnoses,
  loading,
  onViewAll,
  onItemPress,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (diagnoses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="leaf-outline" size={30} color={theme.colors.primary} />
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {t('home.noDiagnosisYet')}
        </Text>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onItemPress('new')}
        >
          <Text style={styles.startButtonText}>{t('home.startDiagnosis')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('home.recentDiagnosis')}
        </Text>
        
        <TouchableOpacity onPress={onViewAll}>
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
            {t('home.viewAll')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {diagnoses.map((diagnosis) => (
        <DiagnosisCard
          key={diagnosis.id}
          diagnosis={diagnosis}
          onPress={() => onItemPress(diagnosis.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});