import { Community } from '@/types/community';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface CommunitySelectorProps {
  communities: Community[];
  selectedCommunityId: number | null;
  onSelectCommunity: (communityId: number | null) => void;
}

export const CommunitySelector = ({ 
  communities, 
  selectedCommunityId, 
  onSelectCommunity 
}: CommunitySelectorProps) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCommunity = selectedCommunityId 
    ? communities.find(c => c.communityId === selectedCommunityId) 
    : null;

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleSelectCommunity = (communityId: number | null) => {
    onSelectCommunity(communityId);
    closeModal();
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.selector, { backgroundColor: theme.colors.card }]} 
        onPress={openModal}
      >
        <Text style={[styles.selectorText, { color: theme.colors.text }]}>
          {selectedCommunity ? selectedCommunity.name : 'All Communities'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
            onTouchEnd={e => e.stopPropagation()}
          >
            <TouchableOpacity
              style={[
                styles.communityItem, 
                selectedCommunityId === null && styles.selectedItem
              ]}
              onPress={() => handleSelectCommunity(null)}
            >
              <Text style={[styles.communityName, { color: theme.colors.text }]}>
                All Communities
              </Text>
              {selectedCommunityId === null && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <FlatList
              data={communities.filter(c => c.joined)}
              keyExtractor={(item) => item.communityId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.communityItem, 
                    selectedCommunityId === item.communityId && styles.selectedItem
                  ]}
                  onPress={() => handleSelectCommunity(item.communityId)}
                >
                  <Text style={[styles.communityName, { color: theme.colors.text }]}>
                    {item.name}
                  </Text>
                  {selectedCommunityId === item.communityId && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  communityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: 'rgba(75, 203, 113, 0.1)',
  },
  communityName: {
    fontSize: 16,
  },
});