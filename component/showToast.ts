import Toast from 'react-native-toast-message';

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  Toast.show({
    type, // 'success', 'error', 'info'
    text1: message,
    position: 'top',
    visibilityTime: 3000, // Duration
    autoHide: true,
    topOffset: 50,
  });
};

export default showToast;
