import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { joinCommunity, leaveCommunity } from '@/redux/slices/communitySlice';

const ConfirmationModal = ({ visible, onClose, onConfirm, loading }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
  
    if (!visible) return null;
  
    return (
      <>
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.overlay]}
        >
          <Pressable 
            style={styles.overlayPressable} 
            onPress={onClose}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
          />
        </Animated.View>
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('home.leave_confirmation_title')}
            </Text>
            <Text style={[styles.modalMessage, { color: theme.colors.text }]}>
              {t('home.leave_confirmation_message')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.redTransparent }]}
                onPress={onConfirm}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.red }]}>
                  {loading ? t('home.leaving') : t('home.confirm_leave')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primaryTransparent }]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.primary }]}>
                  {t('home.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </>
    );
  };

const CommunityHomeActions = ({ community } :any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    try {
      setLoading(true);
      await dispatch(joinCommunity(community?.communityId)).unwrap();
    } catch (error) {
      console.error('Failed to join community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setLoading(true);
      await dispatch(leaveCommunity(community?.communityId)).unwrap();
      setShowLeaveModal(false);
    } catch (error) {
      console.error('Failed to leave community:', error);
    } finally {
      setLoading(false);
    }
  };

  if (community.joined) {
    return (
      <>
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: theme.colors.redTransparent }]}
          onPress={() => setShowLeaveModal(true)}
          disabled={loading}
        >
          <Text style={[styles.joinButtonText, { color: theme.colors.red }]}>
            {loading ? t('home.leaving') : t('home.leave')}
          </Text>
        </TouchableOpacity>
        <ConfirmationModal
          visible={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          onConfirm={handleLeave}
          loading={loading}
        />
      </>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.joinButton, { backgroundColor: theme.colors.primaryTransparent }]}
      onPress={handleJoin}
      disabled={loading}
    >
      <Text style={[styles.joinButtonText, { color: theme.colors.primary }]}>
        {loading ? t('home.joining') : t('home.join')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      },
      overlayPressable: {
        flex: 1,
        width: '100%',
        height: '100%',
      },
      modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      modalContent: {
        width: '100%',
      },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  joinButton: {
    borderWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
});

export default CommunityHomeActions;