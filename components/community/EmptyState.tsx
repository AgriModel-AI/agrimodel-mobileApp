import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  type: 'offline' | 'no-posts';
}

export const EmptyState = ({ type }: EmptyStateProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {type === 'offline' ? (
        <>
          <Ionicons name="cloud-offline" size={80} color={theme.colors.placeholder} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            No internet connection
          </Text>
          <Text style={[styles.message, { color: theme.colors.placeholder }]}>
            Please check your connection and try again to connect with your communities
          </Text>
        </>
      ) : (
        <>
          <Image 
            source={require('@/assets/icons/lightbulb.png')} 
            style={styles.image} 
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            No posts yet
          </Text>
          <Text style={[styles.message, { color: theme.colors.placeholder }]}>
            Be the first to share your knowledge, questions, or insights with the community
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});