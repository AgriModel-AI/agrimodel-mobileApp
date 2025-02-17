import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/ThemeProvider';
const CustomSkeleton = ({ count = 5 }) => {

  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.skeletonContainer}
    >
      {[...Array(count)].map((_, index) => (
        <View
          key={index}
          style={styles.itemContainer}
        >
          <View style={styles.imageContainer}>
            <View style={styles.imageSkeleton}>
              <LinearGradient
                colors={[theme.colors.inputBackground, theme.colors.inputBackground]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[StyleSheet.absoluteFillObject, styles.shimmer]}
              />
            </View>
            <View style={styles.textSkeleton}>
              <LinearGradient
                colors={[theme.colors.inputBackground, theme.colors.inputBackground]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[StyleSheet.absoluteFillObject, styles.shimmer]}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flexGrow: 0,
    marginBottom: 16,
  },
  itemContainer: {
    marginRight: 24,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageSkeleton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    overflow: 'hidden',
  },
  textSkeleton: {
    width: 70,
    height: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
  shimmer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  }
});

export default CustomSkeleton;