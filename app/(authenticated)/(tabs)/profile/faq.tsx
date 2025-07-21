// app/(profile)/faq.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../../contexts/ThemeContext';

// Sample FAQ data
const faqData = [
  {
    id: '1',
    question: 'faq.q1',
    answer: 'faq.a1',
  },
  {
    id: '2',
    question: 'faq.q2',
    answer: 'faq.a2',
  },
  {
    id: '3',
    question: 'faq.q3',
    answer: 'faq.a3',
  },
  {
    id: '4',
    question: 'faq.q4',
    answer: 'faq.a4',
  },
  {
    id: '5',
    question: 'faq.q5',
    answer: 'faq.a5',
  },
  {
    id: '6',
    question: 'faq.q6',
    answer: 'faq.a6',
  },
];

interface FaqItemProps {
  item: {
    id: string;
    question: string;
    answer: string;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ item, isOpen, onToggle }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withTiming(isOpen ? '180deg' : '0deg', { duration: 200 }) },
      ],
    };
  });

  return (
    <View style={[styles.faqItem, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.question, { color: theme.colors.text }]}>
          {t(item.question)}
        </Text>
        <Animated.View style={rotateStyle}>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={theme.colors.text} 
          />
        </Animated.View>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.answerContainer}>
          <Text style={[styles.answer, { color: theme.colors.text }]}>
            {t(item.answer)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function FaqScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const insets = useSafeAreaInsets();
  
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);
  
  const toggleFaq = (id: string) => {
    if (openFaqs.includes(id)) {
      setOpenFaqs(openFaqs.filter(faqId => faqId !== id));
    } else {
      setOpenFaqs([...openFaqs, id]);
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
          {t('faq.title', 'Frequently Asked Questions')}
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
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF9800' + '20' }]}>
            <Ionicons name="help-circle" size={50} color="#FF9800" />
          </View>
        </View>
        
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {t('faq.subtitle', 'Find answers to common questions about our app')}
        </Text>
        
        {faqData.map((item) => (
          <FaqItem
            key={item.id}
            item={item}
            isOpen={openFaqs.includes(item.id)}
            onToggle={() => toggleFaq(item.id)}
          />
        ))}
        
        <View style={styles.contactContainer}>
          <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
            {t('faq.still_have_questions', 'Still have questions?')}
          </Text>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/(authenticated)/(tabs)/profile/help')}
          >
            <Text style={styles.contactButtonText}>
              {t('faq.contact_support', 'Contact Support')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 30,
  },
  faqItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  contactButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});