import React, { useEffect, useState } from 'react';
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
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import showToast from '@/component/showToast';
import { addUserDetail } from '@/redux/slices/userDetailsSlice';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  const { t } = useTranslation();
  
  const [names, setNames] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState<any>(new Date());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [imageChanged, setImageChanged] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [loading, setLoading] = useState(false);

  const [gender, setGender] = useState('Not Selected');
  const [genderOpen, setGenderOpen] = useState(false);

  const [district, setDistrict] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const [profileImage, setProfileImage] = useState('');
  const [isPhotoModalVisible, setPhotoModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  const { userDetails } = useSelector((state: any) => state.userDetails);

  const dispatch = useDispatch<any>();

  useEffect(()=> {

    if (userDetails) {
      setDob(new Date(userDetails.dob));
      setGender(userDetails.gender);
      setDistrict(userDetails.district?.name);
      setProfileImage(userDetails.profilePicture);
      setNames(userDetails.names);
      setAddress(userDetails.address);
      setPhoneNumber(userDetails.phone_number);
      setNationalId(userDetails.national_id);
    }

  }, [userDetails])



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

  const createFormDataWithImage = () => {
    const data = new FormData();
    
    data.append("names", names);
    data.append("national_id", nationalId);
    data.append("phone_number", phoneNumber);
    data.append("district", district);
    data.append("address", address);
    data.append("gender", gender);
    data.append("dob", dob.toISOString().split('T')[0]);

    // Handle image submission
    if (imageChanged && profileImage) {
      // Get the filename from the URI
      const filename = profileImage.split('/').pop() || 'photo.jpg';
      
      // Infer the type from the extension
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      data.append("profilePicture", {
        uri: profileImage,
        name: filename,
        type: type,
      } as any);
    }

    return data;
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
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!pickerResult.canceled && pickerResult.assets) {
      setProfileImage(pickerResult.assets[0].uri);
      setImageChanged(true);
      togglePhotoModal();
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
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!cameraResult.canceled && cameraResult.assets) {
      setProfileImage(cameraResult.assets[0].uri);
      setImageChanged(true);
      togglePhotoModal();
    }
  };

  const handleSave = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });

    if (!names || !nationalId || !phoneNumber || !district || !address || !gender || !dob) {
      showToast('Please fill out all required fields', 'info');
      return;
    }

    const formData = createFormDataWithImage();

    // Log FormData content for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    dispatch(addUserDetail(formData))
      .unwrap()
      .then(() => {
        console.log(userDetails);
        showToast('Profile updated successfully', 'success');
      })
      .catch((error: any) => {
        console.error('Update error:', error);
        showToast(typeof error === 'string' ? error : 'Failed to update profile', 'error');
      })
      .finally(() => {
        setLoading(false);
        buttonScale.value = withTiming(1, { duration: 200 });
      }); 
  };

  const buttonScale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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
            {userDetails?.names}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.text }]}>
            {userDetails?.email}
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
              value={names}
              onChange={(e) => setNames(e.nativeEvent.text)}
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
              value={address}
              onChange={(e) => setAddress(e.nativeEvent.text)}
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
          <MaterialCommunityIcons name="identifier" size={20} color={theme.colors.text} />
            <TextInput
              placeholder="Enter your National ID"
              placeholderTextColor="#aaa"
              style={[styles.textInput, { color: theme.colors.text }]}
              keyboardType="phone-pad"
              value={nationalId}
              onChange={(e) => setNationalId(e.nativeEvent.text)}
            />
          </View>

          <View style={[styles.inputField, { backgroundColor: theme.colors.inputBackground }]}>
            <Feather name="phone" size={20} color={theme.colors.text} />
            <TextInput
              placeholder="Enter your phone number"
              placeholderTextColor="#aaa"
              style={[styles.textInput, { color: theme.colors.text }]}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.nativeEvent.text)}
            />
          </View>

          {/* <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: theme.colors.background }]}>
              {t('profileEdit.save_changes')}
            </Text>
          </TouchableOpacity> */}

          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity onPress={handleSave} disabled={loading} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('profileEdit.save_changes')}</Text>}
            </TouchableOpacity>
          </Animated.View>
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
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_400Regular',
    color: 'white',
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
