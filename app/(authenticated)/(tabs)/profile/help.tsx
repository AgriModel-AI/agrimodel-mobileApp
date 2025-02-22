import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import axiosInstance from '@/utils/axiosInstance';

// Enum for support request types
const SupportRequestType = {
  TECHNICAL: 'Technical Issue',
  PREDICTION_ISSUE: 'Prediction Issue',
  USAGE_HELP: 'Usage Help',
  FEEDBACK: 'Feedback or Suggestions',
  OTHER: 'Other',
};

const CustomDropdown = ({ value, options, onSelect, theme }:any) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.text },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownButtonText, { color: theme.colors.text }]}>
          {value}
        </Text>
        <Feather name="chevron-down" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            {Object.values(options).map((option: any) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  value === option && { backgroundColor: theme.colors.primary + '20' },
                ]}
                onPress={() => {
                  onSelect(option);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, { color: theme.colors.text }]}>
                  {option}
                </Text>
                {value === option && (
                  <Feather name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const HelpPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(SupportRequestType.FEEDBACK);
  const [loading, setLoading] = useState(false);

  const handleSendHelpRequest = async () => {
    const payload = {
      subject,
      description,
      type,
    };

    setLoading(true);
    try {
      const response = await axiosInstance.post('/support', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200 || response.status === 201) {
        Alert.alert(t('help.request_sent', 'Request Sent'), t('help.request_sent_success', 'Your help request has been sent successfully.'));
        router.back();
      } else {
        Alert.alert(t('help.error', 'Error'), t('help.unexpected_error', 'An unexpected error occurred.'));
      }
    } catch (error) {
      console.error('Error sending help request:', error);
      Alert.alert(t('help.error', 'Error'), t('help.failed_to_send_request', 'Failed to send help request.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('help.title', 'Help')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Help Form */}
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('help.subject', 'Subject')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
          value={subject}
          onChangeText={setSubject}
          placeholder={t('help.subject', 'Subject')}
          placeholderTextColor={theme.colors.placeholder}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>{t('help.description', 'Description')}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              height: 100,
              textAlignVertical: 'top',
            },
          ]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder={t('help.description', 'Description')}
          placeholderTextColor={theme.colors.placeholder}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>{t('help.type', 'Type')}</Text>
        <CustomDropdown
          value={type}
          options={SupportRequestType}
          onSelect={setType}
          theme={theme}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleSendHelpRequest}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('help.send_request', 'Send Request')}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
  },
});

export default HelpPage;