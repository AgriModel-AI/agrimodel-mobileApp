import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Platform, ActionSheetIOS, Image, Modal, FlatList, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { useTheme } from "@/hooks/ThemeProvider";
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, FadeIn, withTiming } from "react-native-reanimated";
import { Pressable } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { addDistrict } from "@/redux/slices/userDetailsSlice";
import showToast from "@/component/showToast";
import { createPredict, setLocalImage } from "@/redux/slices/predictSlice";


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

const DiagnosisScreen = () => {
  const { theme } = useTheme();
  const buttonScale = useSharedValue(1);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<any>(null);
  const [district, setDistrict] = useState<any>(null); 
  const [showDistrictModal, setShowDistrictModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<any>(null);
  const [formData, setFormData] = useState<any>();
  
  const dispatch = useDispatch<any>();

  const { userDetails } = useSelector((state: any) => state.userDetails);
  const { t } = useTranslation();
  
  const createFormDataWithImage = (uri:any) => {
    const data = new FormData();
    
    const filename = uri.split('/').pop();
    
    // Infer the type from the extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    data.append("image", {
      uri: uri,
      name: filename,
      type: type,
    } as any);
    return data;
  };

  const handleSubmit = async (data = formData) => {

    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });

    dispatch(createPredict(data))
      .unwrap()
      .then(() => {
        console.log("sending 2")
        router.push('/(authenticated)/(tabs)/diagnosis/result')
      })
      .catch((error: any) => {
        console.log("sending 3")
        const errorMessage = error.response?.data || 'An error occurred. Please try again.';
        showToast(errorMessage, 'error')
      })
      .finally(()=>{
        console.log("sending 4")
        setLoading(false);
        buttonScale.value = withTiming(1, { duration: 200 });
      });
  
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', t('diagnosis.media_permission'));
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('diagnosis.cancel'), t('diagnosis.choose_from_gallery'), t('diagnosis.take_phone_alert')],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromGallery();
          } else if (buttonIndex === 2) {
            takePhoto();
          }
        }
      );
    } else {
      Alert.alert(
        t('diagnosis.option'),
        '',
        [
          { text: t('diagnosis.choose_from_gallery'), onPress: pickImageFromGallery },
          { text: t('diagnosis.take_phone_alert'), onPress: takePhoto },
          { text: t('diagnosis.cancel'), style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        dispatch(setLocalImage(uri));
        
        // Create form data directly here
        const data = createFormDataWithImage(uri);
        setFormData(data);
        // Call handleSubmit with the data
        handleSubmit(data);
      }
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', t('diagnosis.camera_permission'));
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        dispatch(setLocalImage(uri));
        
        // Create form data directly here
        const data = createFormDataWithImage(uri);
        setFormData(data);
        // Call handleSubmit with the data
        handleSubmit(data);
        
      }
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  useEffect(() => {
    // Request camera permission using Expo's Camera API
    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    requestPermissions();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      Alert.alert("Photo Taken", t('diagnosis.picture_captured'));
    } else {
      Alert.alert("Camera Error", t('diagnosis.camera_error'));
    }
  };


  useEffect(() => {
    if (userDetails && userDetails.district?.name) {
      setDistrict(userDetails.district.name);
    }
  }, [userDetails]);

  // Check if district is set before proceeding
  const checkDistrictBeforeImagePicker = () => {
    if (!district) {
      setShowDistrictModal(true);
    } else {
      handleImagePicker();
    }
  };

  // Handle district selection
  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setShowDistrictModal(false);
    setShowConfirmationModal(true);
  };

  // Handle confirmation and update district
  const confirmDistrictSelection = () => {
    if (selectedDistrict) {
      // Create district object and update user details
      const updatedUserDetails: any = {
        district: selectedDistrict
      };
      
      setDistrict(selectedDistrict);
      setLoading(true);
      dispatch(addDistrict(updatedUserDetails))
      .unwrap()
      .then(() => {
        setShowConfirmationModal(false);
        showToast(t('diagnosis.updatedSuccess'), 'info');
      })
      .catch((error: any) => {
        console.error('Update error:', error);
        showToast(typeof error === 'string' ? error : 'Failed to update district', 'error');
      })
      .finally(() => {
        setLoading(false);
        buttonScale.value = withTiming(1, { duration: 200 });
      });
      
    }
  };
  const animatedButtonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonScale.value }],
    }));

  const steps = [
    {
      title: t('diagnosis.take_photo.title'),
      description: t('diagnosis.take_photo.description'),
      icon: "camera",
      bgColor: "#E3F2FD",
    },
    {
      title: t('diagnosis.crop_detection.title'),
      description: t('diagnosis.crop_detection.description'),
      icon: "image-search",
      bgColor: "#FFF3E0",
    },
    {
      title: t('diagnosis.instant_diagnosis.title'),
      description: t('diagnosis.instant_diagnosis.description'),
      icon: "clipboard-check",
      bgColor: "#E8F5E9",
    },
    {
      title: t('diagnosis.treatment_suggestions.title'),
      description: t('diagnosis.treatment_suggestions.description'),
      icon: "medical-bag",
      bgColor: "#F3E5F5",
    },
  ];

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.background,
          paddingVertical: 15,
          paddingHorizontal: 20,
          zIndex: 10,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: theme.colors.text,
          }}
        >
          🌱 {t('diagnosis.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 110, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {steps.map((step, index) => (
          <Pressable
            key={index}
            onPress={() => console.log(`${step.title} clicked!`)}
            android_ripple={{ color: "#ccc", borderless: false }}
            style={{ borderRadius: 12, overflow: "hidden", marginBottom: 15 }}
          >
            <Animated.View
              entering={FadeInUp.delay(index * 200).springify()}
              style={{
                backgroundColor: step.bgColor,
                padding: 15,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name={step.icon as any} size={26} color="#333" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#333" }}>{step.title}</Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: "#666" }}>{step.description}</Text>
              </View>
            </Animated.View>
          </Pressable>
        ))}

        

        <Animated.View entering={FadeIn.delay(500).springify()} style={[buttonAnimatedStyle]}>
          <TouchableOpacity
            onPressIn={() => (buttonScale.value = withSpring(0.95))}
            onPressOut={() => (buttonScale.value = withSpring(1))}
            style={{
              backgroundColor: "#2E7D32",
              padding: 15,
              borderRadius: 10,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
            }}
            activeOpacity={0.8}
            onPress={checkDistrictBeforeImagePicker}
            disabled={loading}
          >
            {!loading && <MaterialCommunityIcons name="camera" size={22} color="#fff" style={{ marginRight: 10 }} />}
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>{t('diagnosis.take_phone_btn')}</Text>}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showDistrictModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '90%',
            maxHeight: '80%',
            backgroundColor: theme.colors.background,
            borderRadius: 15,
            padding: 20,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 15,
              textAlign: 'center',
              color: theme.colors.text
            }}>
              {t('diagnosis.select_district') || 'Select Your District'}
            </Text>
            
            <FlatList
              data={rwandaDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.dark ? '#333' : '#eee',
                  }}
                  onPress={() => handleDistrictSelect(item)}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    color: theme.colors.text
                  }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
            
            <TouchableOpacity
              style={{
                marginTop: 15,
                padding: 12,
                backgroundColor: '#f44336',
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => setShowDistrictModal(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {t('diagnosis.cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: theme.colors.background,
            borderRadius: 10,
            padding: 20,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 15,
              textAlign: 'center',
              color: theme.colors.text
            }}>
              {t('diagnosis.confirm_district') || 'Confirm Your District'}
            </Text>
            
            <Text style={{
              fontSize: 16,
              marginBottom: 20,
              textAlign: 'center',
              color: theme.colors.text
            }}>
              {selectedDistrict}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  marginRight: 10,
                  padding: 12,
                  backgroundColor: '#f44336',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowConfirmationModal(false);
                  setShowDistrictModal(true);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {t('diagnosis.change') || 'Change'}
                </Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#4CAF50',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={confirmDistrictSelection}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {t('diagnosis.confirm') || 'Confirm'}
                </Text>
              </TouchableOpacity> */}
              <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity onPress={confirmDistrictSelection} disabled={loading} style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#4CAF50',
                  borderRadius: 8,
                  alignItems: 'center',
                }}>
                  {loading ? <ActivityIndicator color="#fff" /> : 
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {t('diagnosis.confirm') || 'Confirm'}
                    </Text>
                  }
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DiagnosisScreen;
