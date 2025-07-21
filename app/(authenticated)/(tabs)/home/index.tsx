// app/(authenticated)/(tabs)/home/index.tsx
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommunityPreview } from '../../../../components/home/CommunityPreview';
import { HomeHeader } from '../../../../components/home/HomeHeader';
import { QuickActions } from '../../../../components/home/QuickActions';
// import { RecentDiagnosis } from '../../../../components/home/RecentDiagnosis';
import { useOfflineData } from '@/hooks/useOfflineData';
import { fetchNotifications } from '@/redux/slices/notificationSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { WeatherCard } from '../../../../components/home/WeatherCard';
import { Card } from '../../../../components/ui/Card';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNetworkStatus } from '../../../../hooks/useNetworkStatus';



// import { DiagnosisService } from '../../../../services/api/diagnosisService';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { isConnected } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch<any>();
  
  const [refreshing, setRefreshing] = useState(false);
  // const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  // const [loading, setLoading] = useState(true);

  const { notifications, hasFetched: hasFetchedNotification } = useSelector((state: any) => state.notifications);

  useEffect(() => {
      if (!hasFetchedNotification) {
        dispatch(fetchNotifications());
      }
    }, [dispatch, hasFetchedNotification]);

  const { 
      data, 
      isLoading, 
      hasOfflineData,
      refreshData
    } = useOfflineData();
  
    useEffect(() => {
      // Fetch data when component mounts if we don't have it
      if (!hasOfflineData) {
        refreshData();
      }
    }, [hasOfflineData, refreshData]);
    
    
  
  
  
  // const loadInitialData = async () => {
  //   try {
  //     setLoading(true);
  //     const diagnoses:any = [];
  //     // const diagnoses = await DiagnosisService.getDiagnosisHistory(1, 3);
  //     setRecentDiagnoses(diagnoses);
  //   } catch (error) {
  //     console.error('Error loading initial data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   loadInitialData();
  // }, []);
  
  const onRefresh = async () => {
    if (!isConnected) return;
    
    setRefreshing(true);
    try {
      // await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && !hasOfflineData) {
    return <Text>Loading...</Text>;
  }


  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <HomeHeader 
        userName={data ? data.names : 'guest'}
        avatar={data?.profilePicture}
        onNotificationPress={() => router.push('/(authenticated)/notification')}
        notificationCount={notifications.filter((notification: any) => !notification.isRead).length}
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
            {t('home.welcome', { name: data?.name })}
          </Text>
          <Text style={[styles.welcomeSubtext, { color: theme.colors.text }]}>
            {t('home.whatWouldYouLikeToDo')}
          </Text>
        </View>
        
        <QuickActions
          onDiagnosisPress={() => router.push('/(authenticated)/(tabs)/diagnosis')}
          onExplorePress={() => router.push('/(authenticated)/(tabs)/explore')}
          onCommunityPress={() => router.push('/(authenticated)/(tabs)/community')}
        />
        
        <WeatherCard isConnected={isConnected} />
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('home.recentDiagnosis')}
        </Text>
        
        {/* <RecentDiagnosis
          diagnoses={recentDiagnoses}
          loading={loading}
          onViewAll={() => router.push('/(authenticated)/(tabs)/diagnosis/history')}
          onItemPress={(id) => router.push(`/(authenticated)/(modals)/diagnosis-result?id=${id}`)}
        /> */}
        
        {isConnected && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('home.communityHighlights')}
            </Text>
            
            <CommunityPreview
              onViewAll={() => router.push('/(authenticated)/(modals)/my-communities')}
            />
          </>
        )}
        
        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#FFA500" />
            <Text style={[styles.tipTitle, { color: theme.colors.text, marginLeft: 5 }]}>
              {t('home.tipOfTheDay')}
            </Text>
          </View>
          <Text style={[styles.tipContent, { color: theme.colors.text }]}>
            {t('home.tip')}
          </Text>
        </Card>
        
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtext: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  tipCard: {
    marginTop: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  spacer: {
    height: 20,
  },
});