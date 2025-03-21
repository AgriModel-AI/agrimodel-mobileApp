import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // Add this import

// Toast types
type ToastType = 'success' | 'error' | 'info';

// Toast ref methods
interface ToastHandles {
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

// Global toast reference
let toastRef: React.RefObject<ToastHandles> | null = null;

// Toast component with ref forwarding
const ToastComponent = forwardRef<ToastHandles, {}>((_, ref) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-100)).current;
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<ToastType>('info');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load sounds when component mounts
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // You can use different sounds for different toast types
        const { sound } = await Audio.Sound.createAsync(
          // Use your own sound file path here
          require('../assets/notification.mp3')
        );
        soundRef.current = sound;
      } catch (error) {
        console.warn('Failed to load notification sound:', error);
      }
    };

    loadSounds();

    // Clean up when component unmounts
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play sound function
  const playSound = async () => {
    try {
      if (soundRef.current) {
        // Reset the sound to the beginning
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    show: (msg: string, toastType: ToastType = 'info') => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update state
      setMessage(msg);
      setType(toastType);
      setVisible(true);

      // Animate in
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();

      // Play notification sound
      playSound();

      // Auto hide after 3 seconds
      timeoutRef.current = setTimeout(() => {
        hide();
      }, 3000);
    },
    hide: () => {
      hide();
    },
  }));

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const getIconAndColor = (toastType: ToastType): { icon: string; color: string } => {
    switch (toastType) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#4CAF50' };
      case 'error':
        return { icon: 'alert-circle', color: '#F44336' };
      case 'info':
      default:
        return { icon: 'information-circle', color: '#2196F3' };
    }
  };

  // Don't render if not visible
  if (!visible) return null;

  const { icon, color } = getIconAndColor(type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: translateYAnim }],
          opacity: fadeAnim,
          backgroundColor: color,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={icon as any} size={24} color="white" style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeButton}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create ref for toast component
  const ref = useRef<ToastHandles>(null);
  
  // Set global ref when component mounts
  useEffect(() => {
    toastRef = ref;
    return () => {
      toastRef = null;
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <ToastComponent ref={ref} />
    </View>
  );
};

// Simplified toast function that only accepts message and type
const showToast = (message: string, type: ToastType = 'info'): void => {
  if (toastRef?.current) {
    toastRef.current.show(message, type);
  } else {
    console.warn('Toast not initialized. Make sure to wrap your app with ToastProvider.');
  }
};

export default showToast;