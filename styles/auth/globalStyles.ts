import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_800ExtraBold',
    textTransform: 'capitalize',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Poppins_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontFamily: 'Poppins_400Regular',
    flex: 1,
  },
  visibilityIcon: {
    marginLeft: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_400Regular',
    color: 'white',
  },
  outlinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    marginVertical: 10,
  },
  outlinedButtonText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
    fontFamily: 'Poppins_400Regular',
  },
  termsText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#888',
  },
  link: {
    color: 'rgba(49, 123, 64, 1)', // Match primary color
    fontWeight: 'bold',
  },  
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#888',
  },
  signupLink: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  icon: {
    marginRight: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    fontFamily: 'Poppins_400Regular',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 24,
  },  
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Poppins_400Regular',
  },
});
