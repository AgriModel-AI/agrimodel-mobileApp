// components/onboarding/SlideIndicator.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SlideIndicatorProps {
  count: number;
  activeIndex: number;
}

export const SlideIndicator: React.FC<SlideIndicatorProps> = ({
  count,
  activeIndex,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              width: index === activeIndex ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});