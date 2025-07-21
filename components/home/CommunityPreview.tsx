// components/home/CommunityPreview.tsx
import { Community } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useCommunity } from '../../hooks/useCommunity';

interface CommunityPreviewProps {
  onViewAll: () => void;
}

export const CommunityPreview = ({ onViewAll }: CommunityPreviewProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [previewCommunities, setPreviewCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { communities, communityLoading, communityHasFetched, getCommunities } = useCommunity();
  
  useEffect(() => {
    const loadCommunities = async () => {
      if (!communityHasFetched) {
        setLoading(true);
        await getCommunities();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    
    loadCommunities();
  }, [communityHasFetched, getCommunities]);
  
  useEffect(() => {
    if (communities.length > 0) {
      // Prioritize joined communities, then take the first two
      const joined = communities.filter(c => c.joined);
      const notJoined = communities.filter(c => !c.joined);
      
      if (joined.length >= 2) {
        setPreviewCommunities(joined.slice(0, 2));
      } else if (joined.length === 1) {
        setPreviewCommunities([joined[0], ...(notJoined.length > 0 ? [notJoined[0]] : [])]);
      } else {
        setPreviewCommunities(notJoined.slice(0, 2));
      }
    }
  }, [communities]);
  
  if (loading || communityLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (previewCommunities.length === 0) {
    return (
      <TouchableOpacity 
        style={[styles.emptyContainer, { backgroundColor: theme.colors.card }]}
        onPress={onViewAll}
      >
        <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {t('community.discoverCommunities')}
        </Text>
        <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.container}>
      {previewCommunities.map((community, index) => (
        <Animated.View 
          key={community.communityId}
          entering={FadeIn.delay(index * 100).duration(300)}
        >
          <TouchableOpacity
            style={[styles.communityCard, { backgroundColor: theme.colors.card }]}
            onPress={onViewAll}
          >
            <Image 
              source={{ uri: community.image }} 
              style={styles.communityImage}
              resizeMode="cover"
            />
            <View style={styles.communityInfo}>
              <Text 
                style={[styles.communityName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {community.name}
              </Text>
              <View style={styles.memberInfo}>
                <Ionicons name="people-outline" size={14} color={theme.colors.text} />
                <Text style={[styles.memberCount, { color: theme.colors.text }]}>
                  {community.users} {t('community.members')}
                </Text>
              </View>
              {community.joined && (
                <View style={[styles.joinedBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.joinedText}>{t('community.joined')}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
      
      <TouchableOpacity 
        style={[styles.viewAllButton, { borderColor: theme.colors.border }]} 
        onPress={onViewAll}
      >
        <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
          {t('community.viewAll')}
        </Text>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  loadingContainer: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  communityCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  communityImage: {
    width: 80,
    height: 80,
  },
  communityInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 13,
    marginLeft: 4,
  },
  joinedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  joinedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});