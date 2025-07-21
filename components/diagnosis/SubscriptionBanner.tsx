// components/SubscriptionBanner.tsx
import { useTheme } from '@/contexts/ThemeContext';
import { UsageInfo, UserSubscription } from '@/services/storage/SubscriptionService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionBannerProps {
  usage: UsageInfo;
  subscription: UserSubscription;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ usage, subscription }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const isFree = subscription.subscriptionType === 'free';
  
  // Determine banner color based on usage and plan type
  const getBannerColor = () => {
    if (usage.limitReached) {
      return theme.colors.danger;
    }
    if (isFree) {
      return theme.colors.warning;
    }
    return theme.colors.success;
  };
  
  // Navigate to subscription screen
  const handleUpgrade = () => {
    navigation.navigate('Subscriptions');
  };
  
  return (
    <View style={[styles.banner, { backgroundColor: getBannerColor() }]}>
      <View style={styles.bannerContent}>
        <View style={styles.usageInfo}>
          <Text style={styles.usageText}>
            {usage.limitReached
              ? 'Daily limit reached' 
              : `${usage.attemptsUsed}/${usage.dailyLimit === null ? '∞' : usage.dailyLimit} diagnoses used today`
            }
          </Text>
          <Text style={styles.planText}>
            {subscription.planName} Plan
          </Text>
        </View>
        
        {(isFree || usage.limitReached) && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeText}>
              {isFree ? 'Upgrade' : 'View Plans'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageInfo: {
    flex: 1,
  },
  usageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  planText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  upgradeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 4,
  },
});

export default SubscriptionBanner;