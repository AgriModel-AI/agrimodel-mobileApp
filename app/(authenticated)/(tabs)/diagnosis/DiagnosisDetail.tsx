import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch } from '@/redux/persistConfig';
import { fetchDiagnosisResults, rateDiagnosis } from '@/redux/slices/predictSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const DiagnosisDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  
  const { result } = route.params as { result: any };
  const { ratingLoading, ratingError } = useSelector((state: any) => state.predict);
  
  const [isRating, setIsRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [diagnosisCorrect, setDiagnosisCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [localRated, setLocalRated] = useState(result.rated);
  
  // Handle rating errors
  useEffect(() => {
    if (ratingError) {
      Alert.alert(t('diagnosis.rating_error'), ratingError);
    }
  }, [ratingError, t]);
  
  const formatDate = (dateString:any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleRatePress = () => {
    setIsRating(true);
  };
  
  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert(t('diagnosis.error'), t('diagnosis.select_rating'));
      return;
    }
    
    const ratingData = {
      resultId: result.resultId,
      rating,
      feedback: feedback.trim() || undefined,
      diagnosisCorrect
    };
    
    try {
      await dispatch(rateDiagnosis(ratingData)).unwrap();
      
      // Update local state to reflect rated status
      setLocalRated(true);
      setIsRating(false);
      
      // Refresh results to get updated data
      await dispatch(fetchDiagnosisResults());
      
      Alert.alert(
        t('diagnosis.thank_you'),
        t('diagnosis.feedback_appreciation'),
        [{ text: t('diagnosis.ok') }]
      );
    } catch (error) {
      console.error('Error in component:', error);
    }
  };
  
  const handleCancelRating = () => {
    setIsRating(false);
    setRating(0);
    setDiagnosisCorrect(null);
    setFeedback('');
  };
  
  // Rating stars component
  const RatingStars = () => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={rating >= star ? 'star' : 'star-outline'}
            size={36}
            color={rating >= star ? '#FFD700' : theme.colors.placeholder}
            style={styles.ratingStar}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('diagnosis.details_title')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Plant Image Container */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: result.image_path }} 
            style={styles.plantImage}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
          
          {imageLoading && (
            <View style={[styles.imageLoadingContainer, { backgroundColor: theme.colors.background + 'CC' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.imageLoadingText, { color: theme.colors.text }]}>
                {t('diagnosis.loading_image')}
              </Text>
            </View>
          )}
        </View>
        
        {/* Status Banner */}
        <View style={[
          styles.statusBanner, 
          { 
            backgroundColor: result.detected ? theme.colors.notification + '15' : theme.colors.success + '15',
            borderColor: result.detected ? theme.colors.notification : theme.colors.success
          }
        ]}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: result.detected ? theme.colors.notification : theme.colors.success }
          ]} />
          <Text style={[
            styles.statusText, 
            { color: result.detected ? theme.colors.notification : theme.colors.success }
          ]}>
            {result.detected ? t('diagnosis.disease_detected') : t('diagnosis.healthy_plant')}
          </Text>
        </View>
        
        {/* Disease Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.diseaseName, { color: theme.colors.text }]}>
            {result.detected ? (result.disease?.name || t('diagnosis.unknown_disease')) : t('diagnosis.healthy_plant')}
          </Text>
          
          {result.disease?.cropName && (
            <View style={styles.cropBadge}>
              <MaterialCommunityIcons name="leaf" size={16} color={theme.colors.primary} />
              <Text style={[styles.cropName, { color: theme.colors.primary }]}>
                {result.disease.cropName}
              </Text>
            </View>
          )}
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.text} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {formatDate(result.date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={theme.colors.text} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {result.district?.districtName || t('diagnosis.unknown')}, {result.district?.provinceName || ''}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="code-outline" size={18} color={theme.colors.text} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {t('diagnosis.model_version')}: {result.model_version || '1.0.0'}
            </Text>
          </View>
        </View>
        
        {/* Disease Details (if detected) */}
        {result.detected && result.disease && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('diagnosis.about_disease')}
            </Text>
            <Text style={[styles.sectionText, { color: theme.colors.text }]}>
              {result.disease.description}
            </Text>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>
              {t('diagnosis.symptoms')}
            </Text>
            <Text style={[styles.sectionText, { color: theme.colors.text }]}>
              {result.disease.symptoms}
            </Text>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>
              {t('diagnosis.treatment')}
            </Text>
            <Text style={[styles.sectionText, { color: theme.colors.text }]}>
              {result.disease.treatment}
            </Text>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>
              {t('diagnosis.prevention')}
            </Text>
            <Text style={[styles.sectionText, { color: theme.colors.text }]}>
              {result.disease.prevention}
            </Text>
          </View>
        )}
        
        {/* Rating Section */}
        {!localRated && !isRating && (
          <View style={[styles.rateCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="star-outline" size={32} color={theme.colors.primary} />
            <Text style={[styles.rateTitle, { color: theme.colors.text }]}>
              {t('diagnosis.rate_question')}
            </Text>
            <Text style={[styles.rateSubtitle, { color: theme.colors.placeholder }]}>
              {t('diagnosis.feedback_help')}
            </Text>
            <TouchableOpacity
              style={[styles.rateButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleRatePress}
            >
              <Text style={styles.rateButtonText}>{t('diagnosis.rate_now')}</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Rating Form */}
        {!localRated && isRating && (
          <View style={[styles.ratingForm, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.ratingTitle, { color: theme.colors.text }]}>
              {t('diagnosis.rate_diagnosis')}
            </Text>
            
            <RatingStars />
            
            <Text style={[styles.ratingQuestion, { color: theme.colors.text }]}>
              {t('diagnosis.diagnosis_correct')}
            </Text>
            <View style={styles.correctnessContainer}>
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { 
                    backgroundColor: diagnosisCorrect === true ? theme.colors.success + '20' : theme.colors.card,
                    borderColor: diagnosisCorrect === true ? theme.colors.success : theme.colors.border
                  }
                ]}
                onPress={() => setDiagnosisCorrect(true)}
              >
                <Ionicons 
                  name={diagnosisCorrect === true ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={24} 
                  color={diagnosisCorrect === true ? theme.colors.success : theme.colors.placeholder} 
                />
                <Text style={[
                  styles.correctnessText, 
                  { color: diagnosisCorrect === true ? theme.colors.success : theme.colors.text }
                ]}>
                  {t('diagnosis.yes')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { 
                    backgroundColor: diagnosisCorrect === false ? theme.colors.notification + '20' : theme.colors.card,
                    borderColor: diagnosisCorrect === false ? theme.colors.notification : theme.colors.border
                  }
                ]}
                onPress={() => setDiagnosisCorrect(false)}
              >
                <Ionicons 
                  name={diagnosisCorrect === false ? "close-circle" : "close-circle-outline"} 
                  size={24} 
                  color={diagnosisCorrect === false ? theme.colors.notification : theme.colors.placeholder} 
                />
                <Text style={[
                  styles.correctnessText, 
                  { color: diagnosisCorrect === false ? theme.colors.notification : theme.colors.text }
                ]}>
                  {t('diagnosis.no')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.feedbackLabel, { color: theme.colors.text }]}>
              {t('diagnosis.additional_feedback')}
            </Text>
            <TextInput
              style={[
                styles.feedbackInput, 
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }
              ]}
              placeholder={t('diagnosis.feedback_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
            
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={handleCancelRating}
                disabled={ratingLoading}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>{t('diagnosis.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  { backgroundColor: theme.colors.primary },
                  ratingLoading && styles.disabledButton
                ]}
                onPress={handleSubmitRating}
                disabled={ratingLoading}
              >
                {ratingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('diagnosis.submit')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Already Rated Message */}
        {localRated && (
          <View style={[styles.ratedMessage, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }]}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.ratedText, { color: theme.colors.primary }]}>
              {t('diagnosis.already_rated')}
            </Text>
          </View>
        )}
      </ScrollView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 150, // Increased bottom padding to avoid tab bar overlap
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    marginTop: 16,
    marginHorizontal: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    flex: 1,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  rateCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  rateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  rateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  rateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingForm: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ratingStar: {
    marginHorizontal: 6,
  },
  ratingQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  correctnessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  correctnessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  correctnessText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '48%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  ratedMessage: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratedText: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
  },
});

export default DiagnosisDetailScreen;