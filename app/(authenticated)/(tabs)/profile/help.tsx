import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useTheme } from '../../../../contexts/ThemeContext';
import axiosInstance from '../../../../utils/axiosInstance';

const SupportRequestType = {
  TECHNICAL: 'Technical Issue',
  PREDICTION_ISSUE: 'Prediction Issue',
  USAGE_HELP: 'Usage Help',
  FEEDBACK: 'Feedback or Suggestions',
  OTHER: 'Other',
};

export default function HelpScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const insets = useSafeAreaInsets();
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<keyof typeof SupportRequestType>('TECHNICAL');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!subject) {
      newErrors.subject = t('validation.required', 'This field is required');
    }
    
    if (!description) {
      newErrors.description = t('validation.required', 'This field is required');
    } else if (description.length < 3) {
      newErrors.description = t('validation.min_length', 'Please provide more details (at least 3 characters)');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendHelpRequest = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const payload = {
        subject,
        description,
        type: SupportRequestType[type],
      };

      const response = await axiosInstance.post('/support', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      
      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          t('help.request_sent', 'Request Sent'), 
          t('help.request_sent_success', 'Your help request has been sent successfully.'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          t('help.error', 'Error'), 
          t('help.unexpected_error', 'An unexpected error occurred.')
        );
      }
    } catch (error:any) {
      Alert.alert(
        t('help.error', 'Error'), 
        error?.response?.data.message || t('help.failed_to_send_request', 'Failed to send help request.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (typeKey: string) => {
    return SupportRequestType[typeKey as keyof typeof SupportRequestType] || typeKey;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { 
        borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('help.title', 'Help & Support')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 80 }
            ]}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.info + '20' }]}>
              <Ionicons name="help-buoy" size={50} color={theme.colors.info} />
            </View>
          </View>
          
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {t('help.subtitle', 'How can we help you today? Fill the form below and our support team will get back to you.')}
          </Text>
          
          <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t('help.request_type', 'Request Type')}
              </Text>
              
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={[styles.pickerContainer, { 
                    borderColor: theme.colors.border,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                  }]}
                  onPress={() => setShowTypePicker(true)}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {getTypeLabel(type)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.pickerContainer, { 
                  borderColor: theme.colors.border,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                }]}>
                  <Picker
                    selectedValue={type}
                    onValueChange={(itemValue) => setType(itemValue)}
                    style={[styles.picker, { color: theme.colors.text }]}
                    dropdownIconColor={theme.colors.text}
                  >
                   {Object.entries(SupportRequestType).map(([key, value]) => {
                    return (
                      <Picker.Item 
                        key={key} 
                        label={value} 
                        value={key} 
                        color={isDark ? 'white' : 'black'} 
                      />
                    );
                   })}

                  </Picker>
                </View>
              )}
            </View>
            
            <Input
              label={t('help.subject', 'Subject')}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('help.subject_placeholder', 'Brief description of your issue')}
              error={errors.subject}
            />
            
            <Input
              label={t('help.description', 'Description')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('help.description_placeholder', 'Please provide details about your issue')}
              multiline
              numberOfLines={6}
              error={errors.description}
              inputStyle={styles.textArea}
            />
            
            <Button
              title={t('help.send_request', 'Send Request')}
              onPress={handleSendHelpRequest}
              loading={isLoading}
              style={styles.sendButton}
            />
            
            <View style={[styles.contactInfoContainer, {
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }]}>
              <Text style={[styles.contactInfoTitle, { color: theme.colors.text }]}>
                {t('help.contact_title', 'Contact us directly')}
              </Text>
              
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.contactText, { color: theme.colors.text }]}>
                  support@AgriModel.com
                </Text>
              </View>
              
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.contactText, { color: theme.colors.text }]}>
                  +250 7XX XXX XXX
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Type Picker Modal for iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showTypePicker}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { 
              backgroundColor: isDark ? '#333' : '#fff' 
            }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                  <Text style={{ color: '#007AFF' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowTypePicker(false)}
                >
                  <Text style={{ color: '#007AFF', fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
                itemStyle={{ color: isDark ? 'white' : 'black', height: 150 }}
              >
                {Object.entries(SupportRequestType).map(([key, value]) => (
                  <Picker.Item key={key} label={value} value={key} />
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  formContainer: {
    padding: 20,
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
    justifyContent: 'center',
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  sendButton: {
    marginTop: 16,
    height: 50,
  },
  contactInfoContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'center',
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
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