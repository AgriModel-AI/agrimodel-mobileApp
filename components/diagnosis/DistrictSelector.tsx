// components/DistrictSelector.tsx
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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
}

const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  visible,
  onClose,
  onSelectDistrict
}) => {
  const {theme} = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // Filter districts based on search text
  const filteredDistricts = rwandaDistricts.filter(district => 
    district.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const handleSelect = (district: string) => {
    setSelectedDistrict(district);
  };
  
  const handleConfirm = () => {
    onSelectDistrict(selectedDistrict);
  };
  
  const renderDistrict = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.districtItem,
        selectedDistrict === item && { backgroundColor: theme.colors.primary + '20' }
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[
        styles.districtText, 
        { color: theme.colors.text },
        selectedDistrict === item && { color: theme.colors.primary, fontWeight: 'bold' }
      ]}>
        {item}
      </Text>
      {selectedDistrict === item && (
        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Your District
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.modalSubtitle, { color: theme.colors.text }]}>
            Please select your district to help us provide location-specific disease information.
          </Text>
          
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="search" size={20} color={theme.colors.placeholder} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search districts..."
              placeholderTextColor={theme.colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.placeholder} />
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={filteredDistricts}
            renderItem={renderDistrict}
            keyExtractor={(item) => item}
            style={styles.districtList}
            contentContainerStyle={styles.districtListContent}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: theme.colors.primary },
                !selectedDistrict && { opacity: 0.5 }
              ]}
              onPress={handleConfirm}
              disabled={!selectedDistrict}
            >
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
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
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  districtList: {
    flex: 1,
  },
  districtListContent: {
    paddingBottom: 8,
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  districtText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  confirmButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DistrictSelector;