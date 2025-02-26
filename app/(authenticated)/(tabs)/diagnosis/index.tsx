import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Platform, ActionSheetIOS, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { useTheme } from "@/hooks/ThemeProvider";
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, FadeIn } from "react-native-reanimated";
import { Pressable } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const DiagnosisScreen = () => {
  const { theme } = useTheme();
  const buttonScale = useSharedValue(1);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<any>(null);

  const { t } = useTranslation();

  const [imageUri, setImageUri] = useState<any>(null);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', t('diagnosis.media_permission'));
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('diagnosis.cancel'), t('diagnosis.choose_from_gallery'), t('diagnosis.take_phone_alert')],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromGallery();
          } else if (buttonIndex === 2) {
            takePhoto();
          }
        }
      );
    } else {
      Alert.alert(
        t('diagnosis.option'),
        '',
        [
          { text: t('diagnosis.choose_from_gallery'), onPress: pickImageFromGallery },
          { text: t('diagnosis.take_phone_alert'), onPress: takePhoto },
          { text: t('diagnosis.cancel'), style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64 = result.assets[0].base64;
        const mimeType = result.assets[0].mimeType;

        const image = `data:${mimeType};base64,${base64}`;
        setImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', t('diagnosis.camera_permission'));
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64 = result.assets[0].base64;
        const mimeType = result.assets[0].mimeType;

        const image = `data:${mimeType};base64,${base64}`;
        setImageUri(result.assets[0].uri);

        router.push('/(authenticated)/(tabs)/diagnosis/result')
      }
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  useEffect(() => {
    // Request camera permission using Expo's Camera API
    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    requestPermissions();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      Alert.alert("Photo Taken", t('diagnosis.picture_captured'));
    } else {
      Alert.alert("Camera Error", t('diagnosis.camera_error'));
    }
  };

  const steps = [
    {
      title: t('diagnosis.take_photo.title'),
      description: t('diagnosis.take_photo.description'),
      icon: "camera",
      bgColor: "#E3F2FD",
    },
    {
      title: t('diagnosis.crop_detection.title'),
      description: t('diagnosis.crop_detection.description'),
      icon: "image-search",
      bgColor: "#FFF3E0",
    },
    {
      title: t('diagnosis.instant_diagnosis.title'),
      description: t('diagnosis.instant_diagnosis.description'),
      icon: "clipboard-check",
      bgColor: "#E8F5E9",
    },
    {
      title: t('diagnosis.treatment_suggestions.title'),
      description: t('diagnosis.treatment_suggestions.description'),
      icon: "medical-bag",
      bgColor: "#F3E5F5",
    },
  ];

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.background,
          paddingVertical: 15,
          paddingHorizontal: 20,
          zIndex: 10,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: theme.colors.text,
          }}
        >
          🌱 {t('diagnosis.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 110, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {steps.map((step, index) => (
          <Pressable
            key={index}
            onPress={() => console.log(`${step.title} clicked!`)}
            android_ripple={{ color: "#ccc", borderless: false }}
            style={{ borderRadius: 12, overflow: "hidden", marginBottom: 15 }}
          >
            <Animated.View
              entering={FadeInUp.delay(index * 200).springify()}
              style={{
                backgroundColor: step.bgColor,
                padding: 15,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name={step.icon as any} size={26} color="#333" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#333" }}>{step.title}</Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: "#666" }}>{step.description}</Text>
              </View>
            </Animated.View>
          </Pressable>
        ))}

        

        <Animated.View entering={FadeIn.delay(500).springify()} style={[buttonAnimatedStyle]}>
          <TouchableOpacity
            onPressIn={() => (buttonScale.value = withSpring(0.95))}
            onPressOut={() => (buttonScale.value = withSpring(1))}
            style={{
              backgroundColor: "#2E7D32",
              padding: 15,
              borderRadius: 10,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
            }}
            activeOpacity={0.8}
            onPress={handleImagePicker}
          >
            <MaterialCommunityIcons name="camera" size={22} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>{t('diagnosis.take_phone_btn')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default DiagnosisScreen;
