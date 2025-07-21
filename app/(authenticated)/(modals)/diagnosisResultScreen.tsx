// screens/DiagnosisResultScreen.tsx
import RatingModal from '@/components/diagnosis/RatingModal';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/redux/persistConfig';
import { clearCurrentDiagnosis, rateDiagnosis } from '@/redux/slices/diagnosisSlice';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const DiagnosisResultScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  
  const diagnosis = useSelector((state: RootState) => state.diagnosis.currentDiagnosis);
  
  const [showRating, setShowRating] = useState(false);
  const [activeTab, setActiveTab] = useState<'symptoms' | 'treatment' | 'prevention'>('symptoms');
  
  const handleBack = () => {
    dispatch(clearCurrentDiagnosis());
    navigation.goBack();
  };
  
  const handleShare = async () => {
    if (!diagnosis) return;
    
    try {
      await Share.share({
        message: `I found ${diagnosis.diseaseName} in my ${diagnosis.cropName || 'plant'} using the Plant Disease Diagnosis app!`,
        url: diagnosis.serverImageUrl,
        title: 'Plant Disease Diagnosis Result'
      });
    } catch (error) {
      console.error('Error sharing diagnosis:', error);
      Alert.alert('Error', 'Failed to share diagnosis');
    }
  };
  
  const handleRating = async (rating: number, feedback?: string, isCorrect?: boolean) => {
    if (!diagnosis) return;
    
    try {
      await dispatch(rateDiagnosis({
        diagnosisId: diagnosis.diagnosisId,
        rating,
        feedback,
        isCorrect
      })).unwrap();
      
      setShowRating(false);
      Alert.alert('Thank You', 'Your feedback helps us improve our diagnosis system.');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };
  
  if (!diagnosis) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>No diagnosis available</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Diagnosis')}>
          <Text style={{ color: theme.colors.primary }}>Go to Diagnosis</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Diagnosis Result
        </Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Plant Image */}
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.card }]}>
          <Image 
            source={{ uri: diagnosis.imageUri }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        {/* Diagnosis Info */}
        <View style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={[styles.cropName, { color: theme.colors.text }]}>
                {diagnosis.cropName || 'Unknown Plant'}
              </Text>
              <Text style={[styles.diseaseName, { color: theme.colors.danger }]}>
                {diagnosis.diseaseName}
              </Text>
            </View>
            <View style={[styles.confidenceTag, { backgroundColor: getConfidenceColor(diagnosis.confidence, theme) }]}>
              <Text style={styles.confidenceText}>
                {(diagnosis.confidence * 100).toFixed(0)}% Confidence
              </Text>
            </View>
          </View>
          
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {diagnosis.diseaseDescription || 'No description available'}
          </Text>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'symptoms' && { borderBottomColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('symptoms')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'symptoms' ? theme.colors.primary : theme.colors.text }
              ]}>
                Symptoms
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'treatment' && { borderBottomColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('treatment')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'treatment' ? theme.colors.primary : theme.colors.text }
              ]}>
                Treatment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'prevention' && { borderBottomColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('prevention')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'prevention' ? theme.colors.primary : theme.colors.text }
              ]}>
                Prevention
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'symptoms' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {diagnosis.diseaseSymptoms || 'No symptom information available'}
              </Text>
            )}
            {activeTab === 'treatment' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {diagnosis.diseaseTreatment || 'No treatment information available'}
              </Text>
            )}
            {activeTab === 'prevention' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {diagnosis.diseasePrevention || 'No prevention information available'}
              </Text>
            )}
          </View>
          
          {/* Footer */}
          <View style={styles.resultFooter}>
            <Text style={[styles.resultTimestamp, { color: theme.colors.placeholder }]}>
              Diagnosed on {new Date(diagnosis.timestamp).toLocaleString()}
            </Text>
            <Text style={[styles.resultVersion, { color: theme.colors.placeholder }]}>
              Model v{diagnosis.modelVersion}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Rate Button */}
      {!diagnosis.isRated && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => setShowRating(true)}
          >
            <Ionicons name="star" size={20} color="white" />
            <Text style={styles.rateButtonText}>Rate This Diagnosis</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Rating Modal */}
      <RatingModal
        visible={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={handleRating}
      />
    </View>
  );
};

// Helper function to get confidence color
const getConfidenceColor = (confidence: number, theme: any) => {
  if (confidence >= 0.9) return theme.colors.success;
  if (confidence >= 0.75) return theme.colors.info;
  if (confidence >= 0.5) return theme.colors.warning;
  return theme.colors.danger;
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 16,
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  confidenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  confidenceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 100,
  },
  tabContentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultFooter: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTimestamp: {
    fontSize: 12,
  },
  resultVersion: {
    fontSize: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  rateButton: {
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
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default DiagnosisResultScreen;