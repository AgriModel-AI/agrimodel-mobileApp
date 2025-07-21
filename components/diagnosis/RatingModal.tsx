// components/RatingModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string, isCorrect?: boolean) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);
  
  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    onSubmit(rating, feedback || undefined, isCorrect);
    
    // Reset form
    setRating(0);
    setFeedback('');
    setIsCorrect(undefined);
  };
  
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? theme.colors.warning : theme.colors.border}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Rate This Diagnosis
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              How accurate was the diagnosis?
            </Text>
            <View style={styles.starRating}>
              {renderStars()}
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Was the diagnosis correct?
            </Text>
            <View style={styles.correctnessButtons}>
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { backgroundColor: theme.colors.background },
                  isCorrect === true && { backgroundColor: theme.colors.success }
                ]}
                onPress={() => setIsCorrect(true)}
              >
                <Text style={[
                  styles.correctnessText,
                  { color: theme.colors.text },
                  isCorrect === true && { color: 'white' }
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { backgroundColor: theme.colors.background },
                  isCorrect === false && { backgroundColor: theme.colors.danger }
                ]}
                onPress={() => setIsCorrect(false)}
              >
                <Text style={[
                  styles.correctnessText,
                  { color: theme.colors.text },
                  isCorrect === false && { color: 'white' }
                ]}>
                  No
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { backgroundColor: theme.colors.background },
                  isCorrect === undefined && isCorrect !== null && { backgroundColor: theme.colors.info }
                ]}
                onPress={() => setIsCorrect(undefined)}
              >
                <Text style={[
                  styles.correctnessText,
                  { color: theme.colors.text },
                  isCorrect === undefined && isCorrect !== null && { color: 'white' }
                ]}>
                  Not Sure
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Additional Feedback (Optional)
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
              multiline
              placeholder="Share your thoughts about the diagnosis..."
              placeholderTextColor={theme.colors.placeholder}
              value={feedback}
              onChangeText={setFeedback}
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starContainer: {
    padding: 6,
  },
  correctnessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  correctnessButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  correctnessText: {
    fontWeight: '500',
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RatingModal;