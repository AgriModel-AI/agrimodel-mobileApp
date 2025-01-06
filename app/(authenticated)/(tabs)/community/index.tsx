import React from 'react';
import { View, TextInput, StyleSheet, Text, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedHeader = () => {
  const scrollY = useSharedValue(0);

  const headerHeight = useAnimatedStyle(() => ({
    height: withTiming(scrollY.value > 100 ? 80 : 150, { duration: 300 }), // Shrinks on scroll
  }));

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withTiming(scrollY.value > 100 ? 0 : 1, { duration: 300 }), // Fade out icons
  }));

  return (
    <View style={styles.container}>
      {/* Animated Header Section */}
      <Animated.View style={[styles.header, headerHeight]}>
        <Text style={styles.title}>My Page</Text>
        <Animated.View style={opacityStyle}>
          <TextInput
            placeholder="Search..."
            style={styles.searchInput}
          />
        </Animated.View>
      </Animated.View>

      {/* Posts Section (Scrolls) */}
      <Animated.ScrollView
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        {/* Dummy Posts */}
        {Array.from({ length: 20 }).map((_, index) => (
          <View key={index} style={styles.post}>
            <Text style={styles.postText}>Post {index + 1}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchInput: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  post: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  postText: {
    fontSize: 18,
  },
});

export default AnimatedHeader;
