import { useTheme } from '@/hooks/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import HeaderList from '@/component/community/headerList';
import CommunityItem from '@/component/community/CommunityItem';
import CommunitySkeleton from '@/component/CommunitySkeleton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunities } from '@/redux/slices/communitySlice';

const Community: React.FC = () => {
  const { theme } = useTheme();
  
  const { communities, loading: loadingCommunity , hasFetched: communitesHasFetched} = useSelector((state: any) => state.communites);

  const dispatch = useDispatch<any>();


  useEffect(() => {
    if (!communitesHasFetched) {
      dispatch(fetchCommunities());
    }
  }, [communitesHasFetched, dispatch]);


  return (
    <View style={styles.container}>
      <HeaderList />
      <Animated.ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background, padding: 16 }]}
        contentContainerStyle={{ paddingTop: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loadingCommunity ? (
        <CommunitySkeleton count={3} />
      ) : (
        communities.map((community:any, index: number) => (
          <CommunityItem community={community} index={index} key={community.communityId}/>
        ))
      )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
