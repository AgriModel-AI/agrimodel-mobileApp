import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/ThemeProvider";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import * as FileSystem from 'expo-file-system';

const DiagnosisResultScreen = () => {
  const { theme } = useTheme();

  const { t } = useTranslation();

  const { data, localImage } = useSelector((state: any) => state.predict);
  
  useEffect(() => {
    if (localImage) {
      FileSystem.getInfoAsync(localImage)
        .then(fileInfo => {
          console.log('File exists:', fileInfo.exists);
          console.log('File info:', fileInfo);
        })
        .catch(error => {
          console.error('Error checking file:', error);
        });
    }
  }, [localImage]);
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <TouchableOpacity>
          <MaterialCommunityIcons onPress={()=>router.back()} name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.colors.text }}>
          Coffee Leaf Rust
        </Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="bookmark" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Image Section */}
        {/* {localImage && 
          <Animated.View entering={FadeInUp.springify()}>
            {localImage ? (
              <Animated.View 
                entering={FadeInUp.springify()}
                style={{
                  width: "90%",
                  height: 250,
                  alignSelf: "center",
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginBottom: 15,
                  backgroundColor: '#f0f0f0',
                }}
              >
                <Image
                  source={{ uri: localImage }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                  key={`image-${new Date().getTime()}`}
                  onError={(error) => {
                    console.error('Image loading error:', error.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully');
                  }}
                />
              </Animated.View>
            ) : (
              <View style={{
                width: "90%",
                height: 250,
                alignSelf: "center",
                borderRadius: 12,
                backgroundColor: '#e0e0e0',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <MaterialCommunityIcons name="image-off" size={50} color="#999" />
                <Text style={{ color: '#999', marginTop: 10 }}>No image available</Text>
              </View>
            )}
          </Animated.View>
        } */}


        {/* Audio Section */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={{
          backgroundColor: "#F5F5F5",
          margin: 20,
          padding: 15,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
        }}>
          <MaterialCommunityIcons name="headphones" size={24} color="#333" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", color: "#333" }}>{t('diagnosis.listen')}</Text>
            <Text style={{ fontSize: 14, color: "#666" }}>{t('diagnosis.hands_full')}</Text>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons name="play-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Symptoms Section */}
        <Animated.View entering={FadeIn.delay(400).springify()} style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}>
            <MaterialCommunityIcons name="clipboard-text" size={20} /> {t('diagnosis.symptopms')}
          </Text>
          <Text style={{ marginTop: 5, color: "#666" }}>
            • Symptom Checker helps you understand plant health.
          </Text>
          <Text style={{ color: "#666" }}>• Leaves turn yellow with orange-brown spots.</Text>
          <Text style={{ color: "#666" }}>• Fungal infection spreads, reducing yield.</Text>
        </Animated.View>

        {/* Treatment Section */}
        <Animated.View entering={FadeIn.delay(600).springify()} style={{ paddingHorizontal: 20, marginTop: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}>
            <MaterialCommunityIcons name="leaf" size={20} /> {t('diagnosis.treatment')}
          </Text>
          <Text style={{ marginTop: 5, color: "#666" }}>
            • Use resistant plant varieties.
          </Text>
          <Text style={{ color: "#666" }}>• Apply copper-based fungicides.</Text>
          <Text style={{ color: "#666" }}>• Improve air circulation and sunlight exposure.</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default DiagnosisResultScreen;
