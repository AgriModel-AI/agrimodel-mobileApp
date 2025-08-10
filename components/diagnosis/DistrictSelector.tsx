// components/DistrictSelector.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Rwanda districts
const rwandaDistricts = [
  'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe',
  'Ngoma', 'Nyagatare', 'Rwamagana', 'Burera', 'Gakenke', 'Gicumbi', 'Musanze',
  'Rulindo', 'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza',
  'Nyaruguru', 'Ruhango', 'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke',
  'Rubavu', 'Rusizi', 'Rutsiro',
];

interface DistrictSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectDistrict: (district: string) => void;
  currentDistrict?: string | null;
}

const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  visible,
  onClose,
  onSelectDistrict,
  currentDistrict
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  useEffect(() => {
    if (visible) {
      setSelectedDistrict(currentDistrict || '');
    }
  }, [visible, currentDistrict]);
  
  const handleSelect = (district: string) => {
    setSelectedDistrict(district);
    // Immediately select and close
    onSelectDistrict(district);
    onClose();
  };
  
  const renderDistrict = ({ item }: { item: string }) => {
    const isSelected = selectedDistrict === item;
    
    return (
      <TouchableOpacity
        style={[
          styles.districtItem,
          { borderBottomColor: theme.colors.border },
          isSelected && { 
            backgroundColor: theme.colors.primary + '20'
          }
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.districtText, 
          { color: theme.colors.text },
          isSelected && { 
            color: theme.colors.primary, 
            fontWeight: '600' 
          }
        ]}>
          {item}
        </Text>
        {isSelected && (
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={theme.colors.primary} 
          />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer, 
          { backgroundColor: theme.colors.card }
        ]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('profile.select_district', 'Select District')}
            </Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* District List */}
          <FlatList
            data={rwandaDistricts}
            renderItem={renderDistrict}
            keyExtractor={(item) => item}
            style={styles.districtList}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    height: '70%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  districtList: {
    flex: 1,
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  districtText: {
    fontSize: 16,
    flex: 1,
  },
});

export default DistrictSelector;