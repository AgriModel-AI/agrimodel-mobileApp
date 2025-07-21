import { Community } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Animated,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated2, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface CommunityListProps {
  communities: Community[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectCommunity: (community: Community) => void;
  scrollY: Animated.Value;
  isEmpty: boolean;
  emptyMessage: string;
}

export const CommunityList = ({
  communities,
  loading,
  refreshing,
  onRefresh,
  onSelectCommunity,
  scrollY,
  isEmpty,
  emptyMessage,
}: CommunityListProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  const renderItem = ({ item, index }: { item: Community; index: number }) => (
    <Animated2.View
      entering={FadeIn.delay(index * 100).duration(300)}
    >
      <TouchableOpacity
        style={[styles.communityCard, { backgroundColor: theme.colors.card }]}
        onPress={() => onSelectCommunity(item)}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/80' }}
          style={styles.communityImage}
        />
        <View style={styles.communityDetails}>
          <Text style={[styles.communityName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.communityDescription, { color: theme.colors.placeholder }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={14} color={theme.colors.text} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {item.users} {t('community.members')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="document-text-outline" size={14} color={theme.colors.text} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {item.posts} {t('community.posts')}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.placeholder} />
      </TouchableOpacity>
    </Animated2.View>
  );
  
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="people-outline"
        size={64}
        color={theme.colors.placeholder}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {emptyMessage}
      </Text>
    </View>
  );
  
  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <Animated.FlatList
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: 150 + insets.top,
          paddingBottom: insets.bottom + 20,
          flexGrow: isEmpty ? 1 : undefined,
        },
      ]}
      data={communities}
      keyExtractor={(item) => item.communityId.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={150 + insets.top}
        />
      }
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      ListEmptyComponent={loading ? <LoadingComponent /> : <EmptyComponent />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  communityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  communityDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  communityDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});