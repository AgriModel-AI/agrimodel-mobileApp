import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';

const LandingPage = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={require('@/assets/images/landing.jpg')}
          style={styles.background}
          resizeMode="cover"
          onLoadEnd={() => setLoading(false)} // Detect when image has loaded
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <View style={styles.overlay}>
            {/* Centered Title and Description */}
            <View style={styles.content}>
              <Text style={styles.title}>AgriModel</Text>
              <Text style={styles.description}>Your solution for today and tomorrow</Text>
            </View>

            {/* Bottom Button */}
            <Link href="/login" replace asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
              </Link>
          </View>
        </ImageBackground>
      </View>
    </>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
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
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    backgroundColor: 'rgba(49, 123, 64, 1)',
    borderRadius: 10,
    marginBottom: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
