import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageDropdown from '@/component/LanguageDropdown';
import { useSelector } from 'react-redux';

const LandingPage = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const scaleAnim = useSharedValue(0.8);
  const opacityAnim = useSharedValue(0);
  const titleAnim = useSharedValue(20); // Initial position (y-axis)

  const { userDetails } = useSelector((state: any) => state.userDetails);
  

  // Check authentication
  useEffect(() => {
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (userDetails !== null) {
      router.replace('/(authenticated)/(tabs)');
    } else {
      setCheckingAuth(false); // Show content only if user is not authenticated
    }
  }, [userDetails]);

  // Trigger animations once the image loads
  const handleImageLoad = () => {
    setLoading(false);
    scaleAnim.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp)
    });
    opacityAnim.value = withTiming(1, { duration: 1000 });
    titleAnim.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
  };

  // Animated styles for the content
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value
  }));

  // Animated styles for the title and description
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleAnim.value }],
    opacity: opacityAnim.value
  }));

  // Handle language change
  const handleLanguageChange = async (lang: string) => {
    try {
      await AsyncStorage.setItem('language', lang);
      i18n.changeLanguage(lang);
    } catch (error) {
      console.error('Error saving language to AsyncStorage:', error);
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#31A64C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('@/assets/images/landing.jpg')}
        style={styles.background}
        resizeMode="cover"
        onLoadEnd={handleImageLoad}
      >
        {/* Overlay */}
        <View style={styles.overlay} />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Language Dropdown */}
        <View style={styles.languageDropdownContainer}>
          <LanguageDropdown
            currentLanguage={i18n.language}
            onSelectLanguage={handleLanguageChange}
          />
        </View>

        <Animated.View style={[styles.content, animatedStyle]}>
          <Animated.Text style={[styles.title, titleStyle]}>🌿 AgriModel</Animated.Text>
          <Animated.Text style={[styles.description, titleStyle]}>
            {t('landing.description', 'Your solution for today and tomorrow.')}
          </Animated.Text>
        </Animated.View>

        {/* Get Started Button */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Link href="/(auth)/login" replace asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>{t('landing.getStarted')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark overlay with 80% opacity
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins_900Black',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  description: {
    fontSize: 22,
    color: '#EAEAEA',
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    paddingHorizontal: 30,
    fontStyle: 'italic',
    lineHeight: 28,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    backgroundColor: '#31A64C',
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins_400Regular'
  },
  languageDropdownContainer: {
    position: 'absolute',
    top: 70,
    right: 20,
    zIndex: 10
  }
});

export default LandingPage;
