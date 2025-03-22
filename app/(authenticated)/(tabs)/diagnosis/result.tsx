import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/ThemeProvider";
import Animated, { FadeInUp, FadeIn, ZoomIn } from "react-native-reanimated";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import * as FileSystem from 'expo-file-system';

const DiagnosisResultScreen = () => {
  const { theme } = useTheme();

  const { t } = useTranslation();

  const { data, localImage } = useSelector((state: any) => state.predict);
  
  // useEffect(() => {
  //   if (localImage) {
  //     FileSystem.getInfoAsync(localImage)
  //       .then(fileInfo => {
  //         console.log('File exists:', fileInfo.exists);
  //         console.log('File info:', fileInfo);
  //       })
  //       .catch(error => {
  //         console.error('Error checking file:', error);
  //       });
  //   }
  // }, [localImage]);
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
  {/* Header */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
    }}
  >
    <TouchableOpacity>
      <MaterialCommunityIcons onPress={()=>router.back()} name="arrow-left" size={24} color={theme.colors.text} />
    </TouchableOpacity>
    <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.colors.text, marginLeft:40 }}>
      { data && data.disease_status !== "unknown" ? data.disease_status : t('diagnosis.unknown_disease') }
    </Text>
  </View>

  <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
    {/* Image Section */}
    {(localImage && data && data.disease_status !== "unknown") && 
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
            <Text style={{ color: '#999', marginTop: 10 }}>{t('diagnosis.no_image_available')}</Text>
          </View>
        )}
      </Animated.View>
    }

    { data && data.disease_status !== "unknown" ? 
      <>
        {/* Original content for known diseases */}
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
        { data.diseaseSymptoms && 
          <Animated.View entering={FadeIn.delay(400).springify()} style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}>
              <MaterialCommunityIcons name="clipboard-text" size={20} /> {t('diagnosis.symptopms')}
            </Text>
            <Text style={{ marginTop: 5, color: "#666" }}>
            {data.diseaseSymptoms}
            </Text>
          </Animated.View>
        }

        {/* Treatment Section */}
        {
          data.diseaseTreatment && 
          <Animated.View entering={FadeIn.delay(600).springify()} style={{ paddingHorizontal: 20, marginTop: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}>
              <MaterialCommunityIcons name="leaf" size={20} /> {t('diagnosis.treatment')}
            </Text>
            <Text style={{ marginTop: 5, color: "#666" }}>
            {data.diseaseTreatment}
            </Text>
          </Animated.View>
        }

        {
          data.diseasePrevention && 
          <Animated.View entering={FadeIn.delay(600).springify()} style={{ paddingHorizontal: 20, marginTop: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}>
              <MaterialCommunityIcons name="leaf" size={20} /> {t('diagnosis.prevention')}
            </Text>
            <Text style={{ marginTop: 5, color: "#666" }}>
              {data.diseasePrevention}
            </Text>
          </Animated.View>
        }
      </>
      : 
      // Improved unknown disease section with animations
      <>
        <Animated.View 
          entering={FadeInUp.delay(200).springify()} 
          style={{
            alignItems: 'center',
            marginTop: 30,
            paddingHorizontal: 20,
            width: '100%'
          }}
        >
          <Animated.View 
            entering={ZoomIn.delay(300).springify()}
            style={{
              width: 130,
              height: 130,
              borderRadius: 65,
              backgroundColor: theme.colors.background,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 25,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              borderWidth: 6,
              borderColor: '#f0f0f0'
            }}
          >
            <MaterialCommunityIcons name="leaf-off" size={65} color={theme.colors.primary} />
          </Animated.View>
          
          <Animated.Text
            entering={FadeIn.delay(400).springify()}
            style={{ 
              fontSize: 24, 
              fontWeight: "bold", 
              color: theme.colors.text,
              textAlign: 'center',
              marginBottom: 15,
              letterSpacing: 0.3
            }}
          >
            {t('diagnosis.unknown_title') || "Unidentified Plant Issue"}
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeIn.delay(500).springify()}
            style={{ 
              fontSize: 16, 
              color: theme.colors.text + '99',
              textAlign: 'center',
              marginBottom: 30,
              lineHeight: 24,
              maxWidth: '90%'
            }}
          >
            {t('diagnosis.unknown_message') || "Our system couldn't identify a specific disease from your plant image. This could be because of image quality or a condition outside our database."}
          </Animated.Text>
          
          <Animated.View 
            entering={FadeInUp.delay(600).springify()}
            style={{
              backgroundColor: theme.colors.surface,
              padding: 22,
              borderRadius: 16,
              width: '100%',
              marginBottom: 25,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
              elevation: 3,
              borderWidth: 1,
              borderColor: theme.colors.backdrop || '#eee'
            }}
          >
            <Text style={{ 
              fontSize: 18, 
              fontWeight: "bold", 
              color: theme.colors.text,
              marginBottom: 15,
              letterSpacing: 0.3
            }}>
              <MaterialCommunityIcons name="lightbulb-outline" size={22} color={theme.colors.primary} /> {t('diagnosis.suggestions') || "Recommended Next Steps"}
            </Text>
            
            <View style={{ marginTop: 5 }}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'flex-start', 
                marginBottom: 16,
                paddingVertical: 4
              }}>
                <View style={{
                  backgroundColor: theme.colors.primary + '15',
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 15
                }}>
                  <MaterialCommunityIcons name="image-plus" size={22} color={'white'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: theme.colors.text, 
                    fontWeight: '600',
                    marginBottom: 2
                  }}>
                    {t('diagnosis.try_another_image') || "Try another image"}
                  </Text>
                  <Text style={{ color: theme.colors.text + '99', fontSize: 14 }}>
                    {t('diagnosis.better_photo_tips') || "Use better lighting and focus clearly on affected areas"}
                  </Text>
                </View>
              </View>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'flex-start', 
                marginBottom: 16,
                paddingVertical: 4
              }}>
                <View style={{
                  backgroundColor: theme.colors.primary + '15',
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 15
                }}>
                  <MaterialCommunityIcons name="magnify" size={22} color={'white'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: theme.colors.text, 
                    fontWeight: '600',
                    marginBottom: 2
                  }}>
                    {t('diagnosis.check_plant_health') || "Check for other symptoms"}
                  </Text>
                  <Text style={{ color: theme.colors.text + '99', fontSize: 14 }}>
                    {t('diagnosis.examine_plant_parts') || "Examine leaves, stems and soil for additional clues"}
                  </Text>
                </View>
              </View>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'flex-start',
                paddingVertical: 4
              }}>
                <View style={{
                  backgroundColor: theme.colors.primary + '15',
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 15
                }}>
                  <MaterialCommunityIcons name="account" size={22} color={'white'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: theme.colors.text, 
                    fontWeight: '600',
                    marginBottom: 2
                  }}>
                    {t('diagnosis.consult_expert') || "Consult a plant expert"}
                  </Text>
                  <Text style={{ color: theme.colors.text + '99', fontSize: 14 }}>
                    {t('diagnosis.expert_specific_advice') || "Local agricultural experts can provide specific advice"}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInUp.delay(700).springify()}>
            <TouchableOpacity 
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 30,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="camera-plus" size={20} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={{ 
                color: "#FFF", 
                fontWeight: "bold",
                fontSize: 16,
                letterSpacing: 0.5
              }}>
                {t('diagnosis.try_again') || "Take New Photo"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </>
    }
  </ScrollView>
</View>
  );
};

export default DiagnosisResultScreen;
