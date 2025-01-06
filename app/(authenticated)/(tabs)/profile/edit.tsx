import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  FlatList,
  StatusBar,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { Feather, FontAwesome } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useHeaderHeight } from '@react-navigation/elements';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

const rwandaDistricts = [
  'Gasabo',
  'Kicukiro',
  'Nyarugenge',
  'Bugesera',
  'Gatsibo',
  'Kayonza',
  'Kirehe',
  'Ngoma',
  'Nyagatare',
  'Rwamagana',
  'Burera',
  'Gakenke',
  'Gicumbi',
  'Musanze',
  'Rulindo',
  'Gisagara',
  'Huye',
  'Kamonyi',
  'Muhanga',
  'Nyamagabe',
  'Nyanza',
  'Nyaruguru',
  'Ruhango',
  'Karongi',
  'Ngororero',
  'Nyabihu',
  'Nyamasheke',
  'Rubavu',
  'Rusizi',
  'Rutsiro',
];

const { width, height } = Dimensions.get('window');

const EditProfileScreen = () => {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  
  const [dob, setDob] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [gender, setGender] = useState('Not Selected'); // `null` represents "Not Selected"
  const [genderOpen, setGenderOpen] = useState(false);

  const [district, setDistrict] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/100');
  const [isPhotoModalVisible, setPhotoModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateChange = (date: React.SetStateAction<Date>) => {
    if (date) {
      setDob(date);
    }
    hideDatePicker();
  };

  const toggleModal = () => setModalVisible(!isModalVisible);
  const togglePhotoModal = () => {
    if (!isPhotoModalVisible) {
      setPhotoModalVisible(true);
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setPhotoModalVisible(false));
    }
  };

  const selectDistrict = (selectedDistrict: React.SetStateAction<string>) => {
    setDistrict(selectedDistrict);
    setModalVisible(false);
  };

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to enable permissions to access the gallery.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!pickerResult.canceled && pickerResult.assets) {
      setProfileImage(pickerResult.assets[0].uri); // Access `uri` from the first asset
    }
  };
  
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('profileEdit.permission_denied'), t('profileEdit.enable_permissions_camera'));
      return;
    }
    const cameraResult = await ImagePicker.launchCameraAsync({
      quality: 1,
    });
    if (!cameraResult.canceled && cameraResult.assets) {
      setProfileImage(cameraResult.assets[0].uri); // Access `uri` from the first asset
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="arrow-left" onPress={()=>router.back()} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('profileEdit.edit_profile')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView  showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editIcon} onPress={togglePhotoModal}>
            <FontAwesome name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>
            Uwizeye Eddie
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.text }]}>
            uwizeyeeddie@gmail.com
          </Text>
        </View>

        {/* Input Fields */}
        <View style={styles.form}>
          <View style={[styles.inputField, { backgroundColor: theme.colors.inputBackground }]}>
            <Feather name="user" size={20} color={theme.colors.text} />
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#aaa"
              style={[styles.textInput, { color: theme.colors.text }]}
            />
          </View>

          {/* Gender Dropdown */}
          <View style={{ zIndex: 1000, marginBottom: 16 }}>
            <DropDownPicker
              open={genderOpen}
              value={gender}
              items={[
                {
                  label: 'Not Selected',
                  value: 'Not Selected',
                  icon: () => <Feather name="circle" size={18} color={theme.colors.text} />,
                },
                {
                  label: 'Male',
                  value: 'male',
                  icon: () => <Feather name="user" size={18} color={theme.colors.text} />,
                },
                {
                  label: 'Female',
                  value: 'female',
                  icon: () => <Feather name="user" size={18} color={theme.colors.text} />,
                },
              ]}
              setOpen={setGenderOpen}
              setValue={setGender}
              placeholder="Select Gender"
              style={[
                styles.dropdown,
                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.text },
              ]}
              dropDownContainerStyle={{
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.text,
              }}
              textStyle={{
                color: theme.colors.text,
                fontFamily: 'Poppins_400Regular',
              }}
              placeholderStyle={{ color: '#aaa' }}
            />
          </View>

          {/* District Selector */}
          <TouchableOpacity
            style={[styles.inputField, { backgroundColor: theme.colors.inputBackground }]}
            onPress={toggleModal}
          >
            <Feather name="map-pin" size={20} color={theme.colors.text} />
            <Text style={[styles.textInput, { color: theme.colors.text }]}>
              {district || t('profileEdit.select_district')}
            </Text>
          </TouchableOpacity>

          {/* Modal for District Selection */}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={toggleModal}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {t('profileEdit.select_district')}
                </Text>
                <FlatList
                  data={rwandaDistricts}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => selectDistrict(item)}
                    >
                      <Text style={[styles.modalText, { color: theme.colors.text }]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
                  <Text style={[styles.modalCloseText, { color: theme.colors.primary }]}>
                    {t('profileEdit.close')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={[styles.inputField, { backgroundColor: theme.colors.inputBackground }]}>
            <Feather name="home" size={20} color={theme.colors.text} />
            <TextInput
              placeholder="Enter your address"
              placeholderTextColor="#aaa"
              style={[styles.textInput, { color: theme.colors.text }]}
            />
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            onPress={showDatePicker}
            style={[styles.inputField, { backgroundColor: theme.colors.inputBackground }]}
          >
            <Feather name="calendar" size={20} color={theme.colors.text} />
            <Text style={[styles.textInput, { color: theme.colors.text }]}>
              {dob.toDateString()}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={dob}
            onConfirm={handleDateChange}
            onCancel={hideDatePicker}
          />

          <View style={[styles.inputField, { backgroundColor: theme.colors.inputBackground }]}>
            <Feather name="phone" size={20} color={theme.colors.text} />
            <TextInput
              placeholder="Enter your phone number"
              placeholderTextColor="#aaa"
              style={[styles.textInput, { color: theme.colors.text }]}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.saveButtonText, { color: theme.colors.background }]}>
              {t('profileEdit.save_changes')}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal visible={isPhotoModalVisible} transparent>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.photoModalContent,
                {
                  backgroundColor: theme.colors.background,
                  transform: [{ scale: scaleValue }],
                },
              ]}
            >
              <TouchableOpacity style={styles.photoOption} onPress={openCamera}>
                <Text style={[styles.photoOptionText, { color: theme.colors.text }]}>{t('profileEdit.take_photo')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoOption} onPress={openImagePicker}>
                <Text style={[styles.photoOptionText, { color: theme.colors.text }]}>
                {t('profileEdit.choose_from_gallery')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoOption} onPress={togglePhotoModal}>
                <Text style={[styles.photoOptionText, { color: theme.colors.primary }]}>{t('profileEdit.cancel')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  profileSection: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  editIcon: {
    position: 'absolute',
    top: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  form: {
    marginTop: 16,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: '60%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginVertical: 12,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  modalCloseButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  dropdown: {
    borderRadius: 8,
    paddingHorizontal: 8,
    borderWidth: 0,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  photoModalContent: {
    width: width * 0.8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  photoOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  photoOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
});
