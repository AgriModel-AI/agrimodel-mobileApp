// app/(onboarding)/slides.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorValue, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SlideIndicator } from '../../components/onboarding/SlideIndicator';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  animation: any;
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'onboarding.slide1Title',
    description: 'onboarding.slide1Description',
    animation: require('../../assets/animations/slide1.json'),
    colors: ['#4A00E0', '#8E2DE2'], // Purple gradient
  },
  {
    id: '2',
    title: 'onboarding.slide2Title',
    description: 'onboarding.slide2Description',
    animation: require('../../assets/animations/scan.json'),
    colors: ['#00B4DB', '#0083B0'], // Blue gradient
  },
  {
    id: '3',
    title: 'onboarding.slide3Title',
    description: 'onboarding.slide3Description',
    animation: require('../../assets/animations/slide-3.json'),
    colors: ['#FF416C', '#FF4B2B'], // Red-Orange gradient
  },
];

interface SlideItemProps {
  title: string;
  description: string;
  animation: any;
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
}

// Updated SlideItem component with gradient background
const SlideItem: React.FC<SlideItemProps> = ({ title, description, animation, colors }) => {
  return (
    <View style={styles.slideContainer}>
      <LinearGradient
        colors={colors}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <LottieView 
            source={animation} 
            autoPlay 
            loop 
            style={styles.animation} 
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function SlidesScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  
  const handleNext = (): void => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };
  
  const handleSkip = (): void => {
    completeOnboarding();
  };
  
  const completeOnboarding = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(auth)/login');
    } catch (error) {
      // console.error('Error marking onboarding as completed:', error);
    }
  };
  
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.skipContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => (
          <SlideItem
            title={t(item.title)}
            description={t(item.description)}
            animation={item.animation}
            colors={item.colors}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      
      <View style={styles.footer}>
        <SlideIndicator
          count={slides.length}
          activeIndex={currentIndex}
        />
        
        <Button
          title={currentIndex === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          onPress={handleNext}
          style={styles.nextButton}
          icon={
            currentIndex === slides.length - 1 ? (
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            ) : (
              <Ionicons name="arrow-forward" size={20} color="white" />
            )
          }
          iconPosition="right"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slideContainer: {
    width,
    height: '100%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: 'white',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    width: 150,
    height: 50,
    borderRadius: 25,
  },
});