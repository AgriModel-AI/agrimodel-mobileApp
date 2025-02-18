import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeIn, FadeInUp, FadeOut, BounceIn } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDiseases } from '@/redux/slices/diseaseSlice';
import CustomSkeleton from '@/component/CustomSkeleton';
import { fetchCommunities } from '@/redux/slices/communitySlice';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const { diseases, loading, hasFetched } = useSelector((state: any) => state.diseases);
  const { communities, loading: loadingCommunity , hasFetched: communitesHasFetched, joinLoading, leaveLoading } = useSelector((state: any) => state.communites);

  const dispatch = useDispatch<any>();

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchDiseases());
    }
  }, [hasFetched, dispatch]);


  useEffect(() => {
    if (!communitesHasFetched) {
      dispatch(fetchCommunities());
    }
  }, [communitesHasFetched, dispatch]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: headerHeight }}
      showsVerticalScrollIndicator={false}
    >
      {/* Today's Weather */}
      <Animated.Text entering={FadeInUp.duration(500)} style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('home.today_weather')}
      </Animated.Text>
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={[styles.weatherCard, { backgroundColor: 'rgba(83, 158, 246, 1)' }]}>
        <Text style={[styles.weatherLocation, { color: 'white' }]}>Kigali City, 10 Sept 2024</Text>
        <View style={styles.weatherInfo}>
          <Text style={[styles.temperature, { color: 'white' }]}>28°C</Text>
          <View>
            <Text style={[styles.humidityText, { color: 'white' }]}>{t('home.humidity')} 82%</Text>
            <Text style={[styles.weatherCondition, { color: 'white' }]}>Cloudy</Text>
          </View>
          <MaterialCommunityIcons name="weather-cloudy" size={48} color="white" />
        </View>
        <Text style={[styles.weatherAdvice, { color: 'white' }]}>{t('home.good_weather_advice')}</Text>
      </Animated.View>

      {/* Crops Section */}
      <Animated.Text entering={FadeInUp.delay(200).duration(500)} style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 10 }]}>
        {t('home.crops_detected')}
      </Animated.Text>
      
      {loading ? (
        <CustomSkeleton count={3}/>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsContainer}>
          {diseases.map((disease: any, index: number) => (
            <Animated.View key={disease.diseaseId} entering={BounceIn.delay(300 * index).duration(700)} style={styles.cropItem}>
              <Image source={{ uri: disease.images[0] }} style={styles.cropImage} />
              <Text style={[styles.cropName, { color: theme.colors.text }]}>
                {disease.name}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      )} 

      {/* Community Section */}
      <Animated.Text entering={FadeInUp.delay(300).duration(500)} style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 10 }]}>
        {t('home.community')}
      </Animated.Text>
      {communities.map((community:any, index: number) => (
        <Animated.View key={index} entering={FadeIn.delay(400 * index).duration(600)} exiting={FadeOut} style={[styles.communityItem, { backgroundColor: theme.colors.inputBackground }]}>
          <Image source={{uri: community.image}} style={styles.communityImage} />
          <View style={styles.communityInfo}>
            <Text style={[styles.communityTitle, { color: theme.colors.text }]}>{ community.name }</Text>
            <Text style={[styles.communityMembers, { color: theme.colors.text }]}>{community.users} {t('home.members')}</Text>
          </View>
          {
            community.joined ? (
              <TouchableOpacity style={[styles.joinButton, { backgroundColor: theme.colors.redTransparent }]}>
                <Text style={[styles.joinButtonText, { color: theme.colors.red }]}>{t('home.leave')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.joinButton, { backgroundColor: theme.colors.primaryTransparent }]}>
                <Text style={[styles.joinButtonText, { color: theme.colors.primary }]}>{t('home.join')}</Text>
              </TouchableOpacity>
            )
          }
          
        </Animated.View>
      ))}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  weatherCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  weatherLocation: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 8,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
  },
  humidityText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  weatherCondition: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  weatherAdvice: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 10,
  },
  cropsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cropItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  cropImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  communityMembers: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  joinButton: {
    borderWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
});
