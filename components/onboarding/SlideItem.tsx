// components/onboarding/SlideItem.tsx
import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SlideItemProps {
  title: string;
  description: string;
  animation: any;
  background: any;
}

export const SlideItem: React.FC<SlideItemProps> = ({
  title,
  description,
  animation,
  background,
}) => {
  return (
    <View style={styles.container}>
      <ImageBackground source={background} style={styles.background}>
        <View style={styles.overlay}>
          <View style={styles.animationContainer}>
            <LottieView
              source={animation}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: '100%',
  },
  background: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  animationContainer: {
    width: width * 0.8,
    height: height * 0.3,
    marginBottom: 40,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
});