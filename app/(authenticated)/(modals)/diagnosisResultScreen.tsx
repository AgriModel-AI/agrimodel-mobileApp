// screens/DiagnosisResultScreen.tsx
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/redux/persistConfig';
import { setLocalImage } from '@/redux/slices/predictSlice';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

// Translation helper function
async function translateText(text: any, targetLang: any) {

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: 'en',
          format: "text",
        }),
      }
    );

    const data = await res.json();

    if (data?.data?.translations?.[0]?.translatedText) {
      return data.data.translations[0].translatedText;
    } else {
      throw new Error("Translation failed");
    }
  } catch (error) {
    // console.error("Translation error:", error);
    return null;
  }
}

const DiagnosisResultScreen = () => {
  const {theme} = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  
  const predictData:any = useSelector((state: RootState) => state.predict.data);
  const localImage:any = useSelector((state: RootState) => state.predict.localImage);

  useEffect(()=>{
    // console.log(predictData)
  }, [predictData])
  
  const [activeTab, setActiveTab] = useState<'symptoms' | 'treatment' | 'prevention'>('symptoms');
  
  // Add state for translated content
  const [translatedDescription, setTranslatedDescription] = useState('');
  const [translatedSymptoms, setTranslatedSymptoms] = useState('');
  const [translatedTreatment, setTranslatedTreatment] = useState('');
  const [translatedPrevention, setTranslatedPrevention] = useState('');
  
  // Effect to listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // This will trigger the translation when i18n language changes
      translateContent();
    };
    
    // Initial translation
    translateContent();
    
    // Add listener for language changes
    i18n.on('languageChanged', handleLanguageChange);
    
    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, predictData]);
  
  // Function to translate all relevant content
  const translateContent = async () => {
    if (predictData && predictData.detected) {
      const currentLang = i18n.language;
      
      // Extract source data - use default texts if not available
      const sourceDescription = predictData.diseaseDescription || 
                               t('diagnosis.noDescription', 'No description available');
      const sourceSymptoms = predictData.diseaseSymptoms || 
                            t('diagnosis.noSymptoms', 'No symptom information available');
      const sourceTreatment = predictData.diseaseTreatment || 
                             t('diagnosis.noTreatment', 'No treatment information available');
      const sourcePrevention = predictData.diseasePrevention || 
                              t('diagnosis.noPrevention', 'No prevention information available');
      
      // Only translate if the content is not a default message
      if (sourceDescription !== t('diagnosis.noDescription', 'No description available')) {
        const description = await translateText(sourceDescription, currentLang);
        setTranslatedDescription(description || sourceDescription);
      } else {
        setTranslatedDescription(sourceDescription);
      }
      
      if (sourceSymptoms !== t('diagnosis.noSymptoms', 'No symptom information available')) {
        const symptoms = await translateText(sourceSymptoms, currentLang);
        setTranslatedSymptoms(symptoms || sourceSymptoms);
      } else {
        setTranslatedSymptoms(sourceSymptoms);
      }
      
      if (sourceTreatment !== t('diagnosis.noTreatment', 'No treatment information available')) {
        const treatment = await translateText(sourceTreatment, currentLang);
        setTranslatedTreatment(treatment || sourceTreatment);
      } else {
        setTranslatedTreatment(sourceTreatment);
      }
      
      if (sourcePrevention !== t('diagnosis.noPrevention', 'No prevention information available')) {
        const prevention = await translateText(sourcePrevention, currentLang);
        setTranslatedPrevention(prevention || sourcePrevention);
      } else {
        setTranslatedPrevention(sourcePrevention);
      }
    }
  };
  
  const handleBack = () => {
    dispatch(setLocalImage(null));
    navigation.goBack();
  };
  
  const handleShare = async () => {
    if (!predictData) return;
    
    const message = predictData.detected 
      ? t('diagnosis.shareMessageDetected', 'I found {{disease}} in my {{plant}} plant using the Plant Disease Diagnosis app!', {
          disease: predictData.diseaseName || predictData.disease_status,
          plant: predictData.cropName || predictData.plant_type
        })
      : t('diagnosis.shareMessageNotDetected', 'I scanned a plant using the Plant Disease Diagnosis app!');
    
    try {
      await Share.share({
        message,
        url: predictData.image_url || localImage,
        title: t('diagnosis.shareTitle', 'Plant Disease Diagnosis Result')
      });
    } catch (error) {
      // console.error('Error sharing diagnosis:', error);
      Alert.alert(t('common.error', 'Error'), t('diagnosis.shareError', 'Failed to share diagnosis'));
    }
  };
  
  if (!predictData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>
          {t('diagnosis.noDiagnosis', 'No diagnosis available')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Diagnosis')}>
          <Text style={{ color: theme.colors.primary }}>
            {t('diagnosis.goToDiagnosis', 'Go to Diagnosis')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Handle the case when no disease is detected
  if (!predictData.detected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('diagnosis.resultTitle', 'Diagnosis Result')}
          </Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Plant Image */}
          <View style={[styles.imageContainer, { backgroundColor: theme.colors.card }]}>
            <Image 
              source={{ uri: localImage }} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          
          {/* No Disease Detected Card */}
          <View style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.noResultContainer, { borderColor: theme.colors.border }]}>
              <Ionicons name="leaf-outline" size={48} color={theme.colors.placeholder} />
              <Text style={[styles.noResultTitle, { color: theme.colors.text }]}>
                {t('diagnosis.noDisease', 'No Disease Detected')}
              </Text>
              <Text style={[styles.noResultDescription, { color: theme.colors.text }]}>
                {t('diagnosis.noDiseaseMeaning', "Our system couldn't identify any diseases in this plant. This could mean:")}
              </Text>
              <View style={styles.noResultList}>
                <Text style={[styles.noResultListItem, { color: theme.colors.text }]}>
                  {t('diagnosis.noDiseaseReason1', '• The plant is healthy')}
                </Text>
                <Text style={[styles.noResultListItem, { color: theme.colors.text }]}>
                  {t('diagnosis.noDiseaseReason2', '• The disease is not visible in the image')}
                </Text>
                <Text style={[styles.noResultListItem, { color: theme.colors.text }]}>
                  {t('diagnosis.noDiseaseReason3', '• The disease is not in our database yet')}
                </Text>
              </View>
              <Text style={[styles.noResultNote, { color: theme.colors.text }]}>
                {t('diagnosis.plantType', 'Plant type:')} {predictData.plant_type === "unknown" ? 
                  t('diagnosis.notIdentified', 'Not identified') : 
                  predictData.plant_type}
              </Text>
              <TouchableOpacity 
                style={[styles.tryAgainButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleBack}
              >
                <Text style={styles.tryAgainButtonText}>
                  {t('diagnosis.tryAgain', 'Try Another Image')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Footer */}
            <View style={styles.resultFooter}>
              <Text style={[styles.resultTimestamp, { color: theme.colors.placeholder }]}>
                {t('diagnosis.analyzedIn', 'Analyzed in')} {predictData.prediction_time || "0 seconds"}
              </Text>
              <Text style={[styles.resultVersion, { color: theme.colors.placeholder }]}>
                {t('diagnosis.modelVersion', 'Model v')}{predictData.model_version || "1.0"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
  
  // Extract data for when disease is detected
  const {
    diseaseName = predictData.disease_status || t('diagnosis.unknownDisease', 'Unknown Disease'),
    cropName = predictData.plant_type || t('diagnosis.unknownPlant', 'Unknown Plant'),
    diseaseDescription = t('diagnosis.noDescription', 'No description available'),
    diseaseSymptoms = t('diagnosis.noSymptoms', 'No symptom information available'),
    diseaseTreatment = t('diagnosis.noTreatment', 'No treatment information available'),
    diseasePrevention = t('diagnosis.noPrevention', 'No prevention information available'),
    image_url,
    model_version = '1.0',
    prediction_time
  } = predictData;
  
  // Default confidence value if not provided
  const confidence = 0.8; // You might want to use a real value if available in your API
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('diagnosis.resultTitle', 'Diagnosis Result')}
        </Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Plant Image */}
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.card }]}>
          <Image 
            source={{ uri: image_url || localImage }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        {/* Diagnosis Info */}
        <View style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={[styles.cropName, { color: theme.colors.text }]}>
                {cropName}
              </Text>
              <Text style={[styles.diseaseName, { color: theme.colors.danger }]}>
                {diseaseName}
              </Text>
            </View>
            <View style={[styles.confidenceTag, { backgroundColor: getConfidenceColor(confidence, theme) }]}>
              <Text style={styles.confidenceText}>
                {t('diagnosis.diseaseDetected', 'Disease Detected')}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {translatedDescription || diseaseDescription}
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
                {t('diagnosis.symptoms', 'Symptoms')}
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
                {t('diagnosis.treatment', 'Treatment')}
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
                {t('diagnosis.prevention', 'Prevention')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'symptoms' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {translatedSymptoms || diseaseSymptoms}
              </Text>
            )}
            {activeTab === 'treatment' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {translatedTreatment || diseaseTreatment}
              </Text>
            )}
            {activeTab === 'prevention' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {translatedPrevention || diseasePrevention}
              </Text>
            )}
          </View>
          
          {/* Footer */}
          <View style={styles.resultFooter}>
            <Text style={[styles.resultTimestamp, { color: theme.colors.placeholder }]}>
              {t('diagnosis.analyzedIn', 'Analyzed in')} {prediction_time || "0 seconds"}
            </Text>
            <Text style={[styles.resultVersion, { color: theme.colors.placeholder }]}>
              {t('diagnosis.modelVersion', 'Model v')}{model_version}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 40, // Reduced since there's no rating button
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
  // No result styles
  noResultContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 16,
  },
  noResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  noResultList: {
    alignSelf: 'stretch',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  noResultListItem: {
    fontSize: 14,
    marginBottom: 8,
  },
  noResultNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  tryAgainButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
});

export default DiagnosisResultScreen;