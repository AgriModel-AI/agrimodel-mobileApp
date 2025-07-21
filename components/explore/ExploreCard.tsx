import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../ui/Card';

interface ExploreItem {
  id: number;
  type: string;
  title: string;
  content: string;
  image: string;
  otherImages: string;
  link: string;
  date: string;
}

interface ExploreCardProps {
  item: ExploreItem;
  onPress: () => void;
}

export const ExploreCard: React.FC<ExploreCardProps> = ({ item, onPress }) => {
  const { theme } = useTheme();

  const date = new Date(item.date);
  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <Card style={styles.card}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
        />
        <View style={styles.contentContainer}>
          <Text style={[styles.type, { color: theme.colors.primary }]} numberOfLines={1}>
            {item.type}
          </Text>
          <Text
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <Text style={[styles.date, { color: theme.colors.accent }]}>
            {formattedDate}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  },
  card: {
    height: '100%',
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  contentContainer: {
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  type: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 1,
    flexGrow: 1,
  },
  date: {
    fontSize: 9,
    // marginTop: 'auto',
  },
});
