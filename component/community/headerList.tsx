import { useTheme } from '@/hooks/ThemeProvider';
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { theme } = useTheme();

  const { t } = useTranslation();
  

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity>
          <Feather name="arrow-left" onPress={()=>router.back()} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        {t('home.community')}
        </Text>
        <View style={{ width: 24 }} />
      </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default Header;

