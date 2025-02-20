import { useTheme } from '@/hooks/ThemeProvider';
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  withSpring, 
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import BottomModal, { BottomSheetModalRef } from '@/component/community/CommunityMenuModal';
import { useCommunity } from '@/contexts/CommunityContext';
import { useTranslation } from 'react-i18next';
import PostHeaderSkeleton from '../PostHeaderSkeleton';
import { fetchCommunities } from '@/redux/slices/communitySlice';
import { useDispatch, useSelector } from 'react-redux';


const defaultCommunity = {
  "communityId": 0,
  "name": "All"
};

const Header = ({selectedCommunity, setSelectedCommunity, handleSearch}: any) => {

  const modalRef = useRef<BottomSheetModalRef>(null);
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { scrollY, searchIconClicked } = useCommunity();
  const isHeaderCollapsed = useSharedValue(false);
  const [search, setSearch] = useState<any>('');

  const dispatch = useDispatch<any>();

  const { communities, loading: loadingCommunity , hasFetched: communitesHasFetched} = useSelector((state: any) => state.communites);

  const { t } = useTranslation();

  

  useEffect(() => {
      if (!communitesHasFetched) {
        dispatch(fetchCommunities());
      }
    }, [communitesHasFetched, dispatch]);

    
  useAnimatedReaction(
    () => ({
      scrollingPosition: scrollY.value,
      iconClickedValue: searchIconClicked.value,
    }),
    ({ scrollingPosition, iconClickedValue }) => {
      if (scrollingPosition < 100 || iconClickedValue) {
        isHeaderCollapsed.value = false;
      } else {
        isHeaderCollapsed.value = true;
      }
    }
  );
  

  const headerStyle = useAnimatedStyle(() => ({
    height: withTiming(
      (isHeaderCollapsed.value ) ? 85 : 160, 
      {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    ),
    paddingHorizontal: withTiming(isHeaderCollapsed.value ? 15 : 20, {
      duration: 300,
    }),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: withTiming(isHeaderCollapsed.value ? 14 : 16, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    fontWeight: withTiming(isHeaderCollapsed.value ? '400' : '600', {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    opacity: withTiming(isHeaderCollapsed.value ? 0.7 : 1, {
      duration: 300,
    }),
  }));

  const selectedCommStyle = useAnimatedStyle(() => ({
    fontSize: withTiming(isHeaderCollapsed.value ? 16 : 19, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    fontWeight: '700',
  }));

  const searchContainerStyle = useAnimatedStyle(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    opacity: withTiming(isHeaderCollapsed.value ? 0 : 1, { duration: 200 }),
    height: withTiming(isHeaderCollapsed.value ? 0 : 40),
    marginTop: withTiming(isHeaderCollapsed.value ? 0 : 10),
  }));

  const searchIconStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isHeaderCollapsed.value ? 1 : 0, { duration: 200 }),
    transform: [
      {
        translateX: withSpring(isHeaderCollapsed.value ? 0 : 50),
      },
    ],
  }));

  const mainContentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(isHeaderCollapsed.value ? -15 : 0),
      },
    ],
  }));

  const handleSearchIconClick = () => {
    searchIconClicked.value = true;
  };
  return (
      <Animated.View style={[styles.header, headerStyle]}>
        {/* Part 1: Title */}
        <Animated.Text style={[ titleStyle, { color: theme.colors.text }]}>
          {t('community.community')}
        </Animated.Text>

        {/* Part 2: Dropdown and Menu */}
        <Animated.View style={[styles.row, mainContentStyle]}>

          {
            loadingCommunity ? 
              <PostHeaderSkeleton />
            :
              <Animated.View style={[styles.mainContent]}>
                <Pressable 
                  style={styles.dropdown}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Animated.Text style={[styles.dropdownText, selectedCommStyle, { color: theme.colors.text }]}>{selectedCommunity.name}</Animated.Text>
                  <Feather name="chevron-down" size={20} color={theme.colors.text} />
                </Pressable>
              </Animated.View>
          }
          
          {/* Menu icon in fixed position */}
          <View style={styles.iconGroup}>
            <Animated.View style={searchIconStyle}>
              <Feather 
                name="search" 
                size={20} 
                color={theme.colors.text} 
                onPress={handleSearchIconClick}
              />
            </Animated.View>
          </View>
          <View style={styles.menuContainer}>
            {/* <Link href="/(authenticated)/(modals)/community" asChild> */}
              <Pressable style={styles.menuButton} onPress={() => modalRef.current?.slideIn()} >
                <Feather name="more-horizontal" size={24} color={theme.colors.text} />
              </Pressable>
            {/* </Link> */}
          </View>
        </Animated.View>

        {/* Search container remains the same... */}
        <Animated.View style={searchContainerStyle}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#666" style={styles.searchInputIcon} />
            <TextInput
              placeholder={t('community.search')}
              style={styles.searchInput}
              value={search}
              onChangeText={(text) => setSearch(text)}
            />
          </View>
          <Pressable style={styles.searchButton} onPress={()=> handleSearch(search)}>
            <Text style={[styles.searchButtonText, { color: theme.colors.text }]}>{t('community.search')}</Text>
          </Pressable>
        </Animated.View>

        {/* Dropdown Menu */}
        {(isDropdownOpen && communities) && (
          <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.background }]}>
            <Pressable
                key={defaultCommunity?.communityId}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCommunity(defaultCommunity);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>{defaultCommunity?.name}</Text>
              </Pressable>
            {communities.filter(((community: any) => community.joined)).map((community: any) => (
              <Pressable
                key={community?.communityId}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCommunity(community);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>{community?.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      <BottomModal ref={modalRef} />
      </Animated.View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,

  },
  menuContainer: {
    marginLeft: 12,
    zIndex: 2,
  },
  menuButton: {
    padding: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    maxWidth: '100%',
    marginRight: 0,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchInputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchButtonText: {
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
  },
});

export default Header;
