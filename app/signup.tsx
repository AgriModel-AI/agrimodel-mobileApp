import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/ThemeProvider';
import { Link } from 'expo-router';
import { globalStyles } from '@/styles/auth/globalStyles';

const SignupScreen = () => {
  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+250'); // Default value for phone number
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true); // For password field
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true); // For confirm password field

  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      {/* Fixed Title */}
      <Text style={[globalStyles.title, { color: theme.colors.primary, marginTop: 20 }]}>
        {t('auth.signup.create_account')}
      </Text>

      {/* Scrollable Form */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 20 }}
        showsVerticalScrollIndicator={false} // Hide the scrollbar
      >
        {/* Names */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.signup.names_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.signup.names_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={names}
              onChangeText={setNames}
            />
          </View>
        </View>

        {/* Email */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.signup.email_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.signup.email_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Phone */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.signup.phone_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="phone-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.signup.phone_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad" // Sets numeric keyboard
            />
          </View>
        </View>

        {/* Password */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.signup.password_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.signup.password_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={passwordHidden}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setPasswordHidden(!passwordHidden)} style={globalStyles.visibilityIcon}>
              <MaterialCommunityIcons
                name={passwordHidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={globalStyles.inputGroup}>
          <Text style={[globalStyles.label, { color: theme.colors.text }]}>
            {t('auth.signup.confirm_password_label')}
          </Text>
          <View style={[globalStyles.inputContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#888" />
            <TextInput
              style={[globalStyles.input, { color: theme.colors.text }]}
              placeholder={t('auth.signup.confirm_password_placeholder')}
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={confirmPasswordHidden}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setConfirmPasswordHidden(!confirmPasswordHidden)}
              style={globalStyles.visibilityIcon}
            >
              <MaterialCommunityIcons
                name={confirmPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={[globalStyles.termsText, { justifyContent: 'center' }]}>
          <TouchableOpacity
            onPress={() => setAgreeTerms(!agreeTerms)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            {agreeTerms && (
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
            <Text style={globalStyles.termsLabel}>
              {t('auth.signup.agree_terms')}{' '}
              <Link href={'/terms'} asChild style={[globalStyles.link]}>
                <Text style={[globalStyles.link]}>{t('auth.signup.terms_and_conditions')}</Text>
              </Link>
            </Text>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          onPress={() => console.log('Sign Up')}
          disabled={!agreeTerms}
          style={[
            globalStyles.button,
            {
              backgroundColor: agreeTerms ? theme.colors.primary : theme.colors.primaryTransparent,
            },
          ]}
        >
          <Text style={globalStyles.buttonText}>{t('auth.signup.create_account')}</Text>
        </TouchableOpacity>

        {/* Already have an account */}
        <View style={globalStyles.signupContainer}>
          <Text style={[globalStyles.signupText, { color: theme.colors.text }]}>
            {t('auth.signup.already_have_account')}
          </Text>
          <Link href="/login" replace asChild>
            <TouchableOpacity>
              <Text style={[globalStyles.signupLink, { color: theme.colors.primary }]}>
                {t('auth.signup.login_link')}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;
