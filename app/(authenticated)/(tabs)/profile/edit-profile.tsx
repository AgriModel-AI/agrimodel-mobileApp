import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useOfflineData } from '../../../../hooks/useOfflineData';
import { addUserDetail } from '../../../../redux/slices/userDetailsSlice';

const rwandaDistricts = [
  'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe',
  'Ngoma', 'Nyagatare', 'Rwamagana', 'Burera', 'Gakenke', 'Gicumbi', 'Musanze',
  'Rulindo', 'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza',
  'Nyaruguru', 'Ruhango', 'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke',
  'Rubavu', 'Rusizi', 'Rutsiro',
];

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const { data: user, isLoading } = useOfflineData();

  // Form state
  const [names, setNames] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [district, setDistrict] = useState(null);
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState(new Date());
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const insets = useSafeAreaInsets();
    
  useEffect(() => {
    if (user) {
      setNames(user.names || '');
      setNationalId(user.national_id || '');
      setPhoneNumber(user.phone_number || '');
      setDistrict(user.district?.name || rwandaDistricts[0]);
      setAddress(user.address || '');
      setGender(user.gender || 'male');
      
      if (user.dob) {
        setDob(new Date(user.dob));
      }
      
      if (user.profilePicture) {
        setProfileImage(user.profilePicture);
      }
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!names) newErrors.names = t('validation.required', 'This field is required');
    if (!nationalId) newErrors.nationalId = t('validation.required', 'This field is required');
    if (nationalId && !/^\d{16}$/.test(nationalId)) {
      newErrors.nationalId = t('validation.national_id', 'National ID must be 16 digits');
    }
    
    if (!phoneNumber) newErrors.phoneNumber = t('validation.required', 'This field is required');
    if (phoneNumber && !/^\+2507\d{8}$/.test(phoneNumber)) {
    newErrors.phoneNumber = t(
        'validation.phone',
        'Enter a valid Rwanda phone number (e.g., +250788123456)'
    );
    }

    
    if (!address) newErrors.address = t('validation.required', 'This field is required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('permissions.title', 'Permission Required'),
        t('permissions.camera_roll', 'We need camera roll permissions to upload photos')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('permissions.title', 'Permission Required'),
        t('permissions.camera', 'We need camera permissions to take photos')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
      setImageChanged(true);
    }
  };
  
  const showImageOptions = () => {
    Alert.alert(
      t('profile.change_photo', 'Change Profile Photo'),
      t('profile.photo_source', 'Choose a source'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.take_photo', 'Take Photo'),
          onPress: takePhoto,
        },
        {
          text: t('profile.choose_photo', 'Choose from Gallery'),
          onPress: pickImage,
        },
      ]
    );
  };

  const createFormDataWithImage = () => {
    const data = new FormData();
    
    data.append("names", names);
    data.append("national_id", nationalId);
    data.append("phone_number", phoneNumber);
    data.append("district", district ?? '');
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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);

    const formData = createFormDataWithImage();

    await dispatch(addUserDetail(formData))
      .unwrap()
      .then(() => {
        Alert.alert(
            t('profile.success', 'Success'),
            t('profile.profile_updated', 'Your profile has been updated successfully'),
            [{ text: 'OK', onPress: () => router.back() }]
        );
      })
      .catch((error: any) => {
        Alert.alert(
        t('common.error', 'Error'),
        error || t('profile.update_failed', 'Failed to update profile')
      );
      })
      .finally(() => {
        setSubmitting(false);
      }); 
  };

  const getAvatarPlaceholder = () => {
    return user?.gender?.toLowerCase() === 'female' 
      ? require('../../../../assets/images/female-avatar.png') 
      : require('../../../../assets/images/male-avatar.png');
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('profile.edit_profile', 'Edit Profile')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.profileImageSection}>
              <TouchableOpacity 
                style={styles.profileImageContainer}
                onPress={showImageOptions}
                activeOpacity={0.8}
              >
                <Image 
                  source={profileImage ? { uri: profileImage } : getAvatarPlaceholder()}
                  style={styles.profileImage}
                />
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
                {t('profile.change_photo', 'Change Photo')}
              </Text>
            </View>
            
            <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
              <Input
                label={t('profile.full_name', 'Full Name')}
                value={names}
                onChangeText={setNames}
                placeholder={t('profile.name_placeholder', 'Enter your full name')}
                error={errors.names}
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.text} />}
              />
              
              <Input
                label={t('profile.national_id', 'National ID')}
                value={nationalId}
                onChangeText={setNationalId}
                placeholder="1234567890123456"
                keyboardType="numeric"
                maxLength={16}
                error={errors.nationalId}
                leftIcon={<Ionicons name="card-outline" size={20} color={theme.colors.text} />}
              />
              
              <Input
                label={t('profile.phone', 'Phone Number')}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+2507XXXXXXXX"
                keyboardType="phone-pad"
                error={errors.phoneNumber}
                leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.text} />}
              />
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  {t('profile.district', 'District')}
                </Text>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={[styles.pickerContainer, { 
                      borderColor: theme.colors.border,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    }]}
                    onPress={() => setShowDistrictPicker(true)}
                  >
                    <Text style={[styles.pickerText, { color: theme.colors.text }]}>
                      {district}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.pickerContainer, { 
                    borderColor: theme.colors.border,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'  
                  }]}>
                    <Picker
                      selectedValue={district}
                      onValueChange={(itemValue) => setDistrict(itemValue)}
                      style={[styles.picker, { color: theme.colors.text }]}
                      dropdownIconColor={theme.colors.text}
                    >
                      {rwandaDistricts.map((dist) => (
                        <Picker.Item key={dist} label={dist} value={dist} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
              
              <Input
                label={t('profile.address', 'Address')}
                value={address}
                onChangeText={setAddress}
                placeholder={t('profile.address_placeholder', 'Enter your address')}
                error={errors.address}
                leftIcon={<Ionicons name="location-outline" size={20} color={theme.colors.text} />}
              />
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  {t('profile.gender', 'Gender')}
                </Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={styles.radioOption} 
                    onPress={() => setGender('male')}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.radioButton, 
                      gender === 'male' && { borderColor: theme.colors.primary }
                    ]}>
                      {gender === 'male' && (
                        <View style={[styles.radioButtonSelected, { backgroundColor: theme.colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.radioLabel, { color: theme.colors.text }]}>
                      {t('profile.male', 'Male')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption} 
                    onPress={() => setGender('female')}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.radioButton, 
                      gender === 'female' && { borderColor: theme.colors.primary }
                    ]}>
                      {gender === 'female' && (
                        <View style={[styles.radioButtonSelected, { backgroundColor: theme.colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.radioLabel, { color: theme.colors.text }]}>
                      {t('profile.female', 'Female')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  {t('profile.dob', 'Date of Birth')}
                </Text>
                <TouchableOpacity 
                  style={[styles.datePickerButton, { 
                    borderColor: theme.colors.border,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                  }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.text} style={styles.dateIcon} />
                  <Text style={[styles.dateText, { color: theme.colors.text }]}>
                    {dob.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
              
              <Button
                title={t('common.save', 'Save Changes')}
                onPress={handleSubmit}
                loading={submitting}
                style={styles.saveButton}
              />
            </View>
          </>
        )}
      </ScrollView>
      
      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { 
              backgroundColor: isDark ? '#333' : '#fff' 
            }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: '#007AFF' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={{ color: '#007AFF', fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dob}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                textColor={isDark ? 'white' : 'black'}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* iOS District Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDistrictPicker}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { 
              backgroundColor: isDark ? '#333' : '#fff' 
            }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDistrictPicker(false)}>
                  <Text style={{ color: '#007AFF' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowDistrictPicker(false)}
                >
                  <Text style={{ color: '#007AFF', fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={district}
                onValueChange={(itemValue) => setDistrict(itemValue)}
                itemStyle={{ color: isDark ? 'white' : 'black', height: 150 }}
              >
                {rwandaDistricts.map((dist) => (
                  <Picker.Item key={dist} label={dist} value={dist} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  pickerText: {
    fontSize: 16,
  },
  picker: {
    height: 50,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 16,
    height: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});