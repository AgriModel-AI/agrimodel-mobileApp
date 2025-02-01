import { useTheme } from '@/hooks/ThemeProvider';
import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import HeaderList from '@/component/community/headerList';

interface CommunityItem {
  id: string;
  title: string;
  desc: string;
  image: any;
}

const communities: CommunityItem[] = [
  { id: '1', title: 'Tech Innovators', desc: 'A place for tech enthusiasts.', image: require('@/assets/images/landing.jpg')},
  { id: '2', title: 'Health & Wellness', desc: 'Healthy mind, healthy life.', image: require('@/assets/images/landing.jpg')},
  { id: '3', title: 'Nature Lovers', desc: 'Exploring the beauty of nature.', image: require('@/assets/images/landing.jpg')},
];

const Community: React.FC = () => {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleJoin = (id: string) => {
    setJoinedCommunities([...joinedCommunities, id]);
  };

  const handleRemove = (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to leave this community?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', onPress: () => setJoinedCommunities(joinedCommunities.filter((c) => c !== id)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <HeaderList />
      <Animated.ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingTop: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {communities.map((community, index) => (
          <Animated.View 
            key={community.id} 
            entering={FadeInUp.delay(index * 100)} 
            exiting={FadeOut}
            style={[styles.communityCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary }]}
          >
            <Image source={community.image} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{community.title}</Text>
              {expandedId === community.id && (
                <Text style={[styles.desc, { color: theme.colors.text }]}>{community.desc}</Text>
              )}
              <TouchableOpacity onPress={() => toggleExpand(community.id)}>
                <Text style={[styles.moreLess, { color: theme.colors.primary }]}>{expandedId === community.id ? 'Show Less' : 'Show More'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: joinedCommunities.includes(community.id) ? 'red' : theme.colors.primary }]}
                onPress={() => 
                  joinedCommunities.includes(community.id) 
                    ? handleRemove(community.id) 
                    : handleJoin(community.id)
                }
              >
                <Text style={styles.buttonText}>
                  {joinedCommunities.includes(community.id) ? 'Leave' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  communityCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  desc: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  moreLess: {
    color: 'blue',
    marginTop: 8,
    fontWeight: '600',
  },
  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Community;
