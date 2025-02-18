import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withSpring,
  useSharedValue, 
  interpolate,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const WeatherCard = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  // State to store weather data
  const [weatherData, setWeatherData] = useState<any>(null);

  // Animation values
  const cloudPosition = useSharedValue(0);
  const temperatureScale = useSharedValue(1);
  const humidityOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    // Fetch weather data from the API
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&q=Kigali`);
        
        setWeatherData(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();

    // Cloud floating animation
    cloudPosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Temperature pulsing animation
    temperatureScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Humidity fade-in animation
    humidityOpacity.value = withTiming(1, { duration: 1000 });

    // Card scale animation
    cardScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const cloudStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(cloudPosition.value, [0, 1], [0, 10]) },
      { translateY: interpolate(cloudPosition.value, [0, 1], [0, 5]) },
    ],
  }));

  const temperatureStyle = useAnimatedStyle(() => ({
    transform: [{ scale: temperatureScale.value }],
  }));

  const humidityStyle = useAnimatedStyle(() => ({
    opacity: humidityOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (!weatherData) {
    return <Text>Loading...</Text>;
  }

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <Animated.View 
        style={[styles.weatherCard, { backgroundColor: 'rgba(83, 158, 246, 1)' }]}
      >
        {/* Location and Date */}
        <Text style={[styles.weatherLocation, { color: 'white' }]}>
          {weatherData?.location.name}, {new Date().toLocaleDateString('en-US', { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Text>

        {/* Weather Info */}
        <Animated.View style={styles.weatherInfo}>
          <Animated.Text style={[styles.temperature, { color: 'white' }, temperatureStyle]}>
            {weatherData?.current.temp_c}°C
          </Animated.Text>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="water-percent" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.detailText}>{weatherData?.current.humidity}% {t('home.humidity')}</Text>
          </View>

          <AnimatedIcon 
            name="weather-cloudy" 
            size={48} 
            color="white" 
            style={cloudStyle}
          />
        </Animated.View>

        {/* Weather Advice */}
        <Animated.Text 
          style={[styles.weatherAdvice, { color: 'white' }, humidityStyle]}
        >
          {t('home.good_weather_advice')}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  weatherCard: {
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  humidityContainer: {
    alignItems: 'flex-start',
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
});

export default WeatherCard;
