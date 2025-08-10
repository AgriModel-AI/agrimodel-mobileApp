import DistrictSelector from '@/components/diagnosis/DistrictSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/redux/persistConfig';
import { createPredict, setLocalImage } from '@/redux/slices/predictSlice';
import { addDistrict } from '@/redux/slices/userDetailsSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const DiagnosisScreen = () => {
  const {theme} = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const userDetails = useSelector((state: RootState) => state.userDetails.userDetails);
  const predictLoading = useSelector((state: RootState) => state.predict.loading);
  const predictError = useSelector((state: RootState) => state.predict.error);

  const [showDistrictSelector, setShowDistrictSelector] = useState(false);
  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const buttonOpacity = React.useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      if (userDetails && !userDetails.district) {
        setShowDistrictSelector(true);
      }
    }, [userDetails])
  );

  useEffect(() => {
    if (predictError) {
      Alert.alert(t('diagnosis.errorTitle', 'Diagnosis Error'), predictError);
    }
  }, [predictError, t]);

  // Button animation effects
  useEffect(() => {
    if (predictLoading) {
      Animated.parallel([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [predictLoading, buttonScale, buttonOpacity]);

  const handleDistrictSelect = async (district: string) => {
    if (!district) {
      Alert.alert(t('common.error', 'Error'), t('diagnosis.selectDistrictError', 'Please select a district'));
      return;
    }

    const formData = new FormData();
    formData.append('district', district);

    try {
      await dispatch(addDistrict(formData)).unwrap();
      setShowDistrictSelector(false);
    } catch (error) {
      console.error('Failed to add district:', error);
      Alert.alert(
        t('common.error', 'Error'), 
        t('diagnosis.districtUpdateError', 'Failed to update district. Please try again.')
      );
    }
  };

  const createFormDataWithImage = (uri: string) => {
    const data = new FormData();
    
    const filename = uri.split('/').pop();
    
    // Infer the type from the extension
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    data.append("image", {
      uri: uri,
      name: filename,
      type: type,
    } as any);
    
    return data;
  };

  const handleStartDiagnosis = async () => {
    if (predictLoading) return; // Prevent multiple clicks

    if (!userDetails?.district) {
      setShowDistrictSelector(true);
      return;
    }

    showImagePicker();
  };

  const showImagePicker = async () => {
    Alert.alert(
      t('diagnosis.selectImageSourceTitle', 'Select Image Source'),
      t('diagnosis.selectImageSourceMessage', 'Where would you like to get the image from?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('diagnosis.camera', 'Camera'), onPress: takePicture },
        { text: t('diagnosis.gallery', 'Gallery'), onPress: selectFromGallery },
      ]
    );
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('permissions.title', 'Permission Denied'), 
        t('permissions.camera', 'We need camera permission to take pictures')
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        dispatch(setLocalImage(uri));
        processDiagnosisImage(uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(
        t('common.error', 'Error'), 
        t('diagnosis.takePictureError', 'Failed to take picture. Please try again.')
      );
    }
  };

  const selectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('permissions.title', 'Permission Denied'), 
        t('permissions.gallery', 'We need media library permission to select images')
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        dispatch(setLocalImage(uri));
        processDiagnosisImage(uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert(
        t('common.error', 'Error'), 
        t('diagnosis.selectImageError', 'Failed to select image. Please try again.')
      );
    }
  };

  const processDiagnosisImage = async (imageUri: string) => {
    const formData: any = createFormDataWithImage(imageUri);
    
    dispatch(createPredict(formData))
      .unwrap()
      .then(() => {
        router.push('/(authenticated)/(modals)/diagnosisResultScreen');
      })
      .catch((error) => {
        console.error('Diagnosis error:', error);
        Alert.alert(
          t('common.error', 'Error'), 
          t('diagnosis.processError', 'Failed to process diagnosis. Please try again.')
        );
      });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('diagnosis.screenTitle', 'Plant Disease Diagnosis')}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('history')}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Loading Overlay */}
      {predictLoading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: theme.colors.card }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {t('diagnosis.analyzingImage', 'Analyzing image...')}
            </Text>
            <Text style={[styles.loadingSubtext, { color: theme.colors.placeholder }]}>
              {t('diagnosis.analyzingMoments', 'This may take a few moments')}
            </Text>
          </View>
        </View>
      )}
      
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
            {t('diagnosis.howTo', 'How to Diagnose Plant Diseases')}
          </Text>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>1</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                {t('diagnosis.step1Title', 'Take a Clear Photo')}
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                {t('diagnosis.step1Text', 'Make sure the affected plant part is clearly visible and well-lit.')}
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>2</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                {t('diagnosis.step2Title', 'Submit Your Image')}
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                {t('diagnosis.step2Text', 'Upload your photo and our AI will analyze it.')}
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>3</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                {t('diagnosis.step3Title', 'Review Results')}
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                {t('diagnosis.step3Text', 'Get disease identification and treatment recommendations.')}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.info + '20', borderColor: theme.colors.info }]}>
          <Ionicons name="information-circle" size={24} color={theme.colors.info} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            {t('diagnosis.aiCapabilities', 'Our AI can identify diseases in various crops including coffee, maize, beans, cassava, and more.')}
          </Text>
        </View>
      </ScrollView>
      
      {/* Diagnosis Button */}
      <View style={{
        position: 'absolute',
        bottom: 140, // Increased to be above tabs
        left: 0,
        right: 0,
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 10, // Ensure it's above other elements
      }}>
        <Animated.View style={[
          { transform: [{ scale: buttonScale }], opacity: buttonOpacity }
        ]}>
          <TouchableOpacity
            style={[
              {
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 32,
                minWidth: '80%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 6,
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }
            ]}
            onPress={handleStartDiagnosis}
            disabled={predictLoading}
            activeOpacity={0.7}
          >
            {predictLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="leaf-maple" size={24} color="white" />
                <Text style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 18,
                  marginLeft: 10,
                }}>
                  {t('diagnosis.startButton', 'Start Diagnosis')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* District Selection Modal */}
      <DistrictSelector
        visible={showDistrictSelector}
        onSelectDistrict={handleDistrictSelect}
        onClose={() => setShowDistrictSelector(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  instructionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  instructionNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  diagnosisButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: '80%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  diagnosisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 14,
  }
});

export default DiagnosisScreen;