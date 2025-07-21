// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { WebView } from 'react-native-webview';

// export default function PaymentScreen() {
//   const [paymentLink, setPaymentLink] = useState<string | null>(null);

//   useEffect(() => {
//     // Initiate payment from backend
//     fetch('http://192.168.1.91:5001/initiate-payment', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         tx_ref: 'txn-' + Date.now(),
//         amount: 100,
//         email: 'abdoullatif5027@gmail.com'
//       })
//     })
//       .then(res => res.json())
//       .then(json => {
//         setPaymentLink(json.data.link);
//       });
//   }, []);

//   if (!paymentLink) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <WebView
//       source={{ uri: paymentLink }}
//       onNavigationStateChange={(navState) => {
//         console.log(navState)
//         if (navState.url.includes('payment-complete')) {
//           alert('Payment Complete!');
//         }
//       }}
//     />
//   );
// }

// screens/DiagnosisScreen.tsx
import DistrictSelector from '@/components/diagnosis/DistrictSelector';
import SubscriptionBanner from '@/components/diagnosis/SubscriptionBanner';
import { useTheme } from '@/contexts/ThemeContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { AppDispatch, RootState } from '@/redux/persistConfig';
import { clearError, createDiagnosis } from '@/redux/slices/diagnosisSlice';
import { fetchSubscriptionUsage } from '@/redux/slices/subscriptionSlice';
import { addDistrict } from '@/redux/slices/userDetailsSlice';
import ModelService from '@/services/storage/ModelService';
import SyncService from '@/services/storage/SyncService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected } = useNetworkStatus();
  const router = useRouter();
  
  const userDetails = useSelector((state: RootState) => state.userDetails.userDetails);
  const subscriptionUsage = useSelector((state: RootState) => state.subscription.currentUsage);
  const diagnosisError = useSelector((state: RootState) => state.diagnosis.error);
  const diagnosisLoading = useSelector((state: RootState) => state.diagnosis.loading);
  const currentDiagnosis = useSelector((state: RootState) => state.diagnosis.currentDiagnosis);
  
  const [modelStatus, setModelStatus] = useState<'checking' | 'unknown' | 'available' | 'downloading' | 'unavailable'>('unknown');
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);
  
  // Check for model, sync data, and check district on screen focus
  useFocusEffect(
    useCallback(() => {
      const checkRequirements = async () => {
        // Sync data if online
        if (isConnected) {
          SyncService.performSync().catch(console.error);
        }
        
        // Check if model is available
        try {
          setModelStatus('checking');
          const model = await ModelService.getCurrentModel();
          
          if (model) {
            setModelStatus('available');
          } else if (isConnected) {
            setModelStatus('downloading');
            const updated = await ModelService.checkForUpdates();
            setModelStatus(updated ? 'available' : 'unavailable');
          } else {
            setModelStatus('unavailable');
          }
        } catch (error) {
          console.error('Error checking model:', error);
          setModelStatus('unavailable');
        }
        
        // Fetch subscription usage
        dispatch(fetchSubscriptionUsage());
      };
      
      checkRequirements();
      
      // Check if district is set
      if (userDetails && !userDetails.district) {
        setShowDistrictSelector(true);
      }
    }, [dispatch, isConnected, userDetails])
  );
  
  // Handle diagnosis errors
  useEffect(() => {
    if (diagnosisError) {
      Alert.alert('Diagnosis Error', diagnosisError);
      dispatch(clearError());
    }
  }, [diagnosisError, dispatch]);
  
  // Navigate to result when diagnosis is complete
  useEffect(() => {
    if (currentDiagnosis) {
      router.push('/(authenticated)/(modals)/diagnosisResultScreen');
    }
  }, [currentDiagnosis, navigation, router]);
  
  const handleDistrictSelect = async (district: string) => {
    if (!district) {
      Alert.alert('Error', 'Please select a district');
      return;
    }
    
    const formData = new FormData();
    formData.append('district', district);
    
    try {
      await dispatch(addDistrict(formData)).unwrap();
      setShowDistrictSelector(false);
    } catch (error) {
      console.error('Failed to add district:', error);
      Alert.alert('Error', 'Failed to update district. Please try again.');
    }
  };
  
  const handleStartDiagnosis = async () => {
    // Check if user has a district
    if (!userDetails?.district) {
      setShowDistrictSelector(true);
      return;
    }
    
    // Check subscription status
    if (!subscriptionUsage) {
      if (!isConnected) {
        Alert.alert(
          'Offline Mode', 
          'Please connect to the internet to check your subscription status before diagnosing.'
        );
        return;
      }
      
      // Try to fetch subscription info
      try {
        await dispatch(fetchSubscriptionUsage(true)).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: any) {
        Alert.alert('Error', 'Failed to fetch subscription information. Please try again.');
        return;
      }
    }
    
    // Check if daily limit reached
    if (subscriptionUsage?.usage.limitReached) {
      if (subscriptionUsage.subscription.subscriptionType === 'free') {
        Alert.alert(
          'Free Plan Limit Reached',
          'You have reached your daily limit on the free plan. Would you like to upgrade?',
          [
            { text: 'Not Now', style: 'cancel' },
            { 
              text: 'Upgrade', 
              onPress: () => navigation.navigate('Subscriptions') 
            },
          ]
        );
      } else {
        Alert.alert(
          'Daily Limit Reached',
          'You have reached your daily diagnosis limit. Please try again tomorrow.'
        );
      }
      return;
    }
    
    // Check if model is available
    if (modelStatus !== 'available') {
      if (!isConnected) {
        Alert.alert(
          'Model Not Available',
          'Please connect to the internet to download the diagnosis model.'
        );
      } else {
        Alert.alert(
          'Model Not Ready',
          'The diagnosis model is not ready. Please wait for it to download.'
        );
      }
      return;
    }
    
    // Show image picker
    showImagePicker();
  };
  
  const showImagePicker = async () => {
    Alert.alert(
      'Select Image Source',
      'Where would you like to get the image from?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: takePicture 
        },
        { 
          text: 'Gallery', 
          onPress: selectFromGallery 
        },
      ]
    );
  };
  
  const takePicture = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permission to take pictures');
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
        processDiagnosisImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };
  
  const selectFromGallery = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need media library permission to select images');
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
        processDiagnosisImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  const processDiagnosisImage = async (imageUri: string) => {
    // Ask for crop type
    Alert.prompt(
      'Crop Type',
      'What type of crop is this?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Diagnose',
          onPress: (cropType) => {
            
            // Dispatch create diagnosis action
            dispatch(createDiagnosis({ imageUri }));
          }
        }
      ],
      'plain-text'
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Plant Disease Diagnosis
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('history')}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Subscriptions')}
          >
            <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Subscription Banner */}
      {subscriptionUsage && (
        <SubscriptionBanner 
          usage={subscriptionUsage.usage}
          subscription={subscriptionUsage.subscription}
        />
      )}
      
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Network Status */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Network:</Text>
            <View style={styles.statusValueContainer}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: isConnected ? theme.colors.success : theme.colors.warning }
              ]} />
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {isConnected ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Model:</Text>
            <View style={styles.statusValueContainer}>
              {modelStatus === 'checking' && (
                <>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Checking...</Text>
                </>
              )}
              {modelStatus === 'available' && (
                <>
                  <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success }]} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Ready</Text>
                </>
              )}
              {modelStatus === 'downloading' && (
                <>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Downloading...</Text>
                </>
              )}
              {modelStatus === 'unavailable' && (
                <>
                  <View style={[styles.statusIndicator, { backgroundColor: theme.colors.danger }]} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Not Available</Text>
                </>
              )}
            </View>
          </View>
        </View>
        
        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
            How to Diagnose Plant Diseases
          </Text>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>1</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                Take a Clear Photo
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                Make sure the affected plant part is clearly visible and well-lit.
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>2</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                Identify the Crop Type
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                {"Enter the type of crop you're diagnosing for more accurate results."}
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>3</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                Review Results
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                Get disease identification and treatment recommendations.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Diagnosis Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.diagnosisButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleStartDiagnosis}
          disabled={diagnosisLoading}
        >
          {diagnosisLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="leaf-maple" size={24} color="white" />
              <Text style={styles.diagnosisButtonText}>Start Diagnosis</Text>
            </>
          )}
        </TouchableOpacity>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  diagnosisButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  diagnosisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default DiagnosisScreen;