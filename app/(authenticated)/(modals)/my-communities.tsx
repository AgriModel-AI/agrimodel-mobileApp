// app/(authenticated)/communities/index.tsx
import { Community } from '@/types/community';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar, TabView } from 'react-native-tab-view';
import { AnimatedHeader } from '../../../components/community/AnimatedHeader';
import { CommunityList } from '../../../components/community/CommunityList';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCommunity } from '../../../hooks/useCommunity';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import CommunityModal from './CommunityModal';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CommunitiesScreen() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'joined', title: t('community.joined') },
    { key: 'discover', title: t('community.discover') },
  ]);

  const scrollYRefs = useRef<{ [key: string]: Animated.Value }>({
    joined: new Animated.Value(0),
    discover: new Animated.Value(0),
  });

  const activeScrollY = scrollYRefs.current[routes[index].key];

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    communities,
    communityLoading,
    communityHasFetched,
    getCommunities,
    join,
    leave,
    joinLoading,
    leaveLoading,
  } = useCommunity();

  // Filter communities for each tab
  const joinedCommunities = communities.filter(c => c.joined);
  const notJoinedCommunities = communities.filter(c => !c.joined);

  // Initial data fetch
  useEffect(() => {
    if (isConnected && !communityHasFetched) {
      getCommunities();
    }
  }, [isConnected, communityHasFetched, getCommunities]);

  const onRefresh = async () => {
    if (!isConnected) return;

    setRefreshing(true);
    try {
      await getCommunities();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleJoinLeave = async (community: Community) => {
    if (community.joined) {
      await leave(community.communityId);
    } else {
      await join(community.communityId);
    }
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    const scrollY = scrollYRefs.current[route.key];
    switch (route.key) {
      case 'joined':
        return (
          <CommunityList
            communities={joinedCommunities}
            loading={communityLoading}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onSelectCommunity={handleSelectCommunity}
            scrollY={scrollY}
            isEmpty={joinedCommunities.length === 0}
            emptyMessage={t('community.noJoinedCommunities')}
          />
        );
      case 'discover':
        return (
          <CommunityList
            communities={notJoinedCommunities}
            loading={communityLoading}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onSelectCommunity={handleSelectCommunity}
            scrollY={scrollY}
            isEmpty={notJoinedCommunities.length === 0}
            emptyMessage={t('community.noCommunitiesToDiscover')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <AnimatedHeader title={t('navigation.communities')} scrollY={activeScrollY} />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: SCREEN_WIDTH }}
        renderTabBar={props => (
          <Animated.View
            style={{
              transform: [
                {
                  translateY: activeScrollY.interpolate({
                    inputRange: [0, 100],
                    outputRange: [81 + insets.top, 56 + insets.top],
                    extrapolate: 'clamp',
                  }),
                },
              ],
              zIndex: 20,
            }}
          >
            <TabBar
              {...props}
              style={{ backgroundColor: theme.colors.background, marginTop: -1 }}
              indicatorStyle={{ backgroundColor: theme.colors.primary }}
              activeColor={theme.colors.primary}
              inactiveColor={theme.colors.placeholder}
            />
          </Animated.View>
        )}
      />

      {selectedCommunity && (
        <CommunityModal
          visible={modalVisible}
          community={selectedCommunity}
          onClose={handleCloseModal}
          onJoinLeave={handleJoinLeave}
          isLoading={joinLoading || leaveLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
