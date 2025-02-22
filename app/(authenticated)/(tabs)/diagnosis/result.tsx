import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/ThemeProvider";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const DiagnosisResultScreen = () => {
  const { theme } = useTheme();

  const { t } = useTranslation();
  
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
        <Animated.View entering={FadeInUp.springify()}>
          <Image
            source={require('@/assets/images/landing.jpg')}
            style={{ width: "90%", height: 200, alignSelf: "center", borderRadius: 12 }}
            resizeMode="cover"
          />
        </Animated.View>

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
