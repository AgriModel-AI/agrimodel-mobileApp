import { Community } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCommunity } from '../../../hooks/useCommunity';

interface CommunityModalProps {
  visible: boolean;
  community: Community;
  onClose: () => void;
  onJoinLeave: (community: Community) => void;
  isLoading: boolean;
}

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CommunityModal = ({ 
  visible, 
  community, 
  onClose,
  onJoinLeave,
  isLoading
}: CommunityModalProps) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const { join, leave, communities } = useCommunity()

  const [isJoined, setIsJoined] = useState<any>(community.joined);

  useEffect(() => {
    // Check if the community is joined or not
    const isCommunityJoined = communities.find(c => c.communityId === community.communityId);
    setIsJoined(isCommunityJoined?.joined);
  }, [communities, community.communityId]);
  
  // Confirm before leaving a community
  const handleJoinLeave = () => {
    if (isJoined) {
      Alert.alert(
        t('community.leaveConfirmTitle'),
        t('community.leaveConfirmMessage', { name: community.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('community.leave'), 
            onPress: () => { leave(community.communityId).then(() => setIsJoined(false)); },
            style: 'destructive'
          }
        ]
      );
    } else {
      join(community.communityId).then(() => setIsJoined(true));
    }
  };
  
  // Animations for header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  
  const imageScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1.2],
    extrapolate: 'clamp',
  });
  
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0.8, 0.9, 1],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            { height: headerHeight }
          ]}
        >
          <Animated.Image
            source={{ uri: community.image || 'https://via.placeholder.com/400' }}
            style={[
              styles.headerImage,
              {
                opacity: imageOpacity,
                transform: [{ scale: imageScale }],
              },
            ]}
          />
          
          <BlurView
            intensity={0}
            tint={isDark ? 'dark' : 'light'}
            style={styles.headerOverlay}
          />
          
          {/* Header Controls */}
          <View style={[styles.headerControls, { paddingTop: insets.top }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Animated.Text
              style={[
                styles.headerTitle,
                {
                  opacity: titleOpacity,
                  transform: [{ scale: titleScale }],
                },
              ]}
            >
              {community.name}
            </Animated.Text>
            
            <View style={styles.rightSpacer} />
          </View>
        </Animated.View>
        
        {/* Scrollable Content */}
        <Animated.ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 }
          ]}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <View style={styles.contentHeader}>
            <Text style={[styles.communityName, { color: theme.colors.text }]}>
              {community.name}
            </Text>
            
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={18} color={theme.colors.text} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {community.users}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.placeholder }]}>
                  {t('community.members')}
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.stat}>
                <Ionicons name="document-text-outline" size={18} color={theme.colors.text} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {community.posts}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.placeholder }]}>
                  {t('community.posts')}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('community.about')}
            </Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              {community.description}
            </Text>
          </View>
          
          <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('community.created')}
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {format(new Date(community.createdAt), 'MMMM d, yyyy')}
            </Text>
          </View>
        </Animated.ScrollView>
        
        {/* Join/Leave Button */}
        <View style={[
          styles.bottomBar, 
          { 
            backgroundColor: theme.colors.card,
            paddingBottom: insets.bottom || 16
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isJoined ? theme.colors.danger : theme.colors.primary,
                opacity: isLoading ? 0.7 : 1
              }
            ]}
            onPress={handleJoinLeave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
              
                {
                    isJoined ?
                    <>
                        <Ionicons 
                            name={"exit-outline"} 
                            size={20} 
                            color="#fff" 
                            style={styles.actionIcon}
                        />
                        <Text style={styles.actionButtonText}>
                            {t('community.leave')}
                        </Text>
                    </>
                    
                    :
                    <>
                        <Ionicons 
                            name={"enter-outline"} 
                            size={20} 
                            color="#fff" 
                            style={styles.actionIcon}
                        />
                        <Text style={styles.actionButtonText}>
                            {t('community.join')}
                        </Text>
                    </>
                }
                
                
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CommunityModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: HEADER_MAX_HEIGHT,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT,
  },
  contentHeader: {
    padding: 20,
  },
  communityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ccc',
  },
  section: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  dateText: {
    fontSize: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  actionButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});