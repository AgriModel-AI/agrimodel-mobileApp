import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeIn, FadeInUp, FadeOut, BounceIn } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDiseases } from '@/redux/slices/diseaseSlice';
import DiseaseSkeleton from '@/component/DiseaseSkeleton';
import { fetchCommunities } from '@/redux/slices/communitySlice';
import CommunityHomeActions from '@/component/CommunityHomeActions';
import CommunitySkeleton from '@/component/CommunitySkeleton';
import WeatherCard from '@/component/WeatherCard';
import { Link, router } from 'expo-router';

const CommunityItem = ({community, index}:any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();


  return (
    <TouchableOpacity onPress={() =>
        router.push({
        pathname: '/(authenticated)/(page)/details',
        params: { id: community.communityId, community: JSON.stringify(community) },
        })} key={community.id}>
        <Animated.View 
        key={index} 
        entering={FadeIn.delay(400 * index).duration(600)} 
        exiting={FadeOut} 
        style={[styles.communityItem, { backgroundColor: theme.colors.inputBackground }]}
        >
        <Image source={{uri: community.image}} style={styles.communityImage} />
        <View style={styles.communityInfo}>
            <Text style={[styles.communityTitle, { color: theme.colors.text }]}>
            {community.name}
            </Text>
            <Text style={[styles.communityMembers, { color: theme.colors.text }]}>
            {community.users} {t('home.members')}
            </Text>
        </View>
        <CommunityHomeActions community={community} />
        </Animated.View>
    </TouchableOpacity>
  );
};

export default CommunityItem;

const styles = StyleSheet.create({
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  communityMembers: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
});
