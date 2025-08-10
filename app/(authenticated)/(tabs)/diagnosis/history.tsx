import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/redux/persistConfig';
import { fetchDiagnosisResults } from '@/redux/slices/predictSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const HistoryScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation(); // Added useTranslation hook
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { results, loading, hasFetched } = useSelector((state: RootState) => state.predict);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchDiagnosisResults());
    }
  }, [dispatch, hasFetched]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchDiagnosisResults());
    setRefreshing(false);
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleResultPress = (result: any) => {
    navigation.navigate('DiagnosisDetail', { result });
  };

  const renderHistoryItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.historyCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardLayout}>
        <Image 
          source={{ uri: item.image_path }} 
          style={styles.historyImage}
          resizeMode="cover"
        />
        
        <View style={styles.historyContent}>
          <Text style={[styles.diseaseTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.detected ? 
              (item.disease?.name || t('diagnosis.history.unknownDisease', 'Unknown Disease')) : 
              t('diagnosis.history.healthyPlant', 'Healthy Plant')}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={12} color={theme.colors.text} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={12} color={theme.colors.text} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: theme.colors.text }]} numberOfLines={1}>
              {item.district?.districtName || t('diagnosis.history.unknownLocation', 'Unknown')}
            </Text>
          </View>
          
          <View style={styles.badgeRow}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.detected ? theme.colors.notification + '15' : theme.colors.success + '15' }
            ]}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: item.detected ? theme.colors.notification : theme.colors.success }
              ]} />
              <Text style={[
                styles.statusText, 
                { color: item.detected ? theme.colors.notification : theme.colors.success }
              ]}>
                {item.detected ? 
                  t('diagnosis.history.diseaseDetected', 'Disease Detected') : 
                  t('diagnosis.history.healthy', 'Healthy')}
              </Text>
            </View>
            
            {item.rated && (
              <View style={[styles.ratedBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="star" size={10} color={theme.colors.primary} />
                <Text style={[styles.ratedText, { color: theme.colors.primary }]}>
                  {t('diagnosis.history.rated', 'Rated')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="leaf-maple-off" 
        size={80} 
        color={theme.colors.placeholder} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {t('diagnosis.history.noDiagnosesYet', 'No Diagnoses Yet')}
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>
        {t('diagnosis.history.emptyMessage', 'Your plant disease diagnosis history will appear here')}
      </Text>
      <TouchableOpacity
        style={[styles.newDiagnosisButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('diagnosis')}
      >
        <MaterialCommunityIcons name="leaf-maple" size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.newDiagnosisText}>
          {t('diagnosis.history.startNewDiagnosis', 'Start New Diagnosis')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('diagnosis.history.title', 'Diagnosis History')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('diagnosis.history.loading', 'Loading your diagnosis history...')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderHistoryItem}
          keyExtractor={(item:any) => item.resultId.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  historyCard: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardLayout: {
    flexDirection: 'row',
    height: 110,
  },
  historyImage: {
    width: 110,
    height: '100%',
  },
  historyContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  diseaseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratedText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 500,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '80%',
    lineHeight: 22,
  },
  newDiagnosisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  newDiagnosisText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HistoryScreen;