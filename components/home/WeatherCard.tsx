// components/home/WeatherCard.tsx
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../ui/Card';

interface WeatherCardProps {
  isConnected: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ isConnected }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);


  useEffect(() => {
    // Fetch weather data from the API
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&q=Kigali`);
        
        setWeatherData(response.data);
        setLoading(false);
      } catch (error) {
        // console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();

  }, []);
  
  if (!isConnected) {
    return (
      <Card style={styles.offlineCard}>
        <View style={styles.offlineContent}>
          <Ionicons name="cloud-offline" size={24} color={theme.colors.text} />
          <Text style={[styles.offlineText, { color: theme.colors.text }]}>
            {t('home.weatherOffline')}
          </Text>
        </View>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud" size={24} color={theme.colors.text} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('home.loadingWeather')}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.location, { color: theme.colors.text }]}>
            {weatherData?.location.name}
          </Text>
          <Text style={[styles.date, { color: theme.colors.text }]}>
            {new Date().toLocaleDateString(t('locale'), {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <View style={styles.temperature}>
          <Text style={[styles.temperatureText, { color: theme.colors.text }]}>
            {weatherData?.current.temp_c}°C
          </Text>
        </View>
      </View>
      
      <View style={styles.currentWeather}>
        <Ionicons
          name={'partly-sunny'}
          size={60}
          color={theme.colors.primary}
        />
        <Text style={[styles.condition, { color: theme.colors.text }]}>
          {weatherData?.current.condition.text}
        </Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="water-outline" size={16} color={theme.colors.text} />
          
          <Text style={[styles.detailText, { color: theme.colors.text }]}>
            {weatherData?.current.humidity}% {t('home.humidity')}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="leaf-outline" size={16} color={theme.colors.text} />
          <Text style={[styles.detailText, { color: theme.colors.text }]}>
            {weatherData?.current.wind_kph} km/h {t('home.wind')}
          </Text>
        </View>
      </View>
      
      
    </Card>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 64,
    height: 64,
  },
  card: {
    padding: 16,
  },
  offlineCard: {
    padding: 16,
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    marginLeft: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  temperature: {
    alignItems: 'flex-end',
  },
  temperatureText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  condition: {
    fontSize: 18,
    marginLeft: 12,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  forecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  forecastDay: {
    alignItems: 'center',
  },
  forecastDayText: {
    fontSize: 14,
    marginBottom: 4,
  },
  forecastIcon: {
    marginVertical: 4,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: '500',
  },
});