import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ExploreCard } from '../../../../components/explore/ExploreCard';
import { FilterTabs } from '../../../../components/explore/FilterTabs';
import { SearchBar } from '../../../../components/explore/SearchBar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNetworkStatus } from '../../../../hooks/useNetworkStatus';
import { AppDispatch, RootState } from '../../../../redux/persistConfig';
import { fetchExploreItems, setActiveFilter, setSearchQuery } from '../../../../redux/slices/exploreSlice';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { isConnected } = useNetworkStatus();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const {
    filteredItems,
    activeFilter,
    searchQuery,
    loading
  } = useSelector((state: RootState) => state.explore);

  useEffect(() => {
    if (isConnected) {
      dispatch(fetchExploreItems());
    }
  }, [dispatch, isConnected]);

  const handleFilterChange = (filter: string) => {
    dispatch(setActiveFilter(filter));
  };

  const handleSearch = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const handleRefresh = () => {
    if (isConnected) {
      dispatch(fetchExploreItems());
    }
  };

  const navigateToDetail = (id: number) => {
    router.push(`/(authenticated)/(tabs)/explore/category/${id}`);
  };

  const filters = [
    { id: 'all', label: t('explore.all') },
    { id: 'ONLINE-SERVICES', label: t('explore.onlineServices') },
    { id: 'UPDATES', label: t('explore.updates') },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <ExploreCard item={item} onPress={() => navigateToDetail(item.id)} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('explore.title')}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder={t('explore.searchPlaceholder')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FilterTabs
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {!isConnected && (
        <View style={[styles.offlineContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="cloud-offline-outline" size={24} color={theme.colors.danger} />
          <Text style={[styles.offlineText, { color: theme.colors.text }]}>
            {t('explore.offlineMessage')}
          </Text>
        </View>
      )}

      {loading && filteredItems.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContent, {paddingBottom: insets.bottom + 55}]}
          numColumns={2}
          columnWrapperStyle={styles.rowContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isConnected ? (
                <>
                  <Ionicons
                    name="search-outline"
                    size={50}
                    color={theme.colors.primary}
                    style={styles.emptyIcon}
                  />
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    {t('explore.noResults')}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={50}
                    color={theme.colors.danger}
                    style={styles.emptyIcon}
                  />
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    {t('explore.connectToExplore')}
                  </Text>
                </>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  rowContainer: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemContainer: {
    width: (width - 48) / 2,
    height: 180,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  offlineText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
