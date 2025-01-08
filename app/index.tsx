import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';

const LandingPage = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const scaleAnim = useSharedValue(0.8);
  const opacityAnim = useSharedValue(0);

  // Trigger animation once the image has loaded
  const handleImageLoad = () => {
    setLoading(false);
    scaleAnim.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    opacityAnim.value = withTiming(1, { duration: 1000 });
  };

  // Animated styles for content box
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  return (
    <View style={[styles.container]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('@/assets/images/landing.jpg')}
        style={styles.background}
        resizeMode="cover"
        onLoadEnd={handleImageLoad}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Modern Design with Animation */}
        <Animated.View style={[styles.content, animatedStyle]}>
          <Text style={styles.title}>🌿 AgriModel</Text>
          <Text style={styles.description}>
            Your solution for today and tomorrow.
          </Text>
        </Animated.View>

        {/* Get Started Button */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Link href="/login" replace asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Get Started</Text>
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
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins_900Black',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins_400Regular',
  },
});

export default LandingPage;
