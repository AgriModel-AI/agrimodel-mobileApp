import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/ThemeProvider";
import Animated, { FadeInUp, FadeIn, ZoomIn } from "react-native-reanimated";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

const ReadableText = ({ 
  text, 
  style, 
  isReading, 
  currentPosition, 
  highlightColor = "#42A5F550",
  language
}: any) => {
  if (!text) return null;

  // Split text into words for highlighting
  const words = text.split(' ');
  const currentIndex = currentPosition || 0;
  
  return (
    <Text style={style}>
      {words.map((word:any, index:any) => (
        <Text
          key={index}
          style={{
            backgroundColor: isReading && index <= currentIndex ? highlightColor : 'transparent',
            fontWeight: isReading && index <= currentIndex ? 'bold' : 'normal',
            padding: 1,
            borderRadius: 2
          }}
        >
          {word}{' '}
        </Text>
      ))}
    </Text>
  );
};

// Modified DiagnosisResultScreen with unified text-to-speech control
const DiagnosisResultScreen = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { data, localImage } = useSelector((state: any) => state.predict);
  const currentLanguage = i18n.language || 'en';
  
  
  // State for text-to-speech functionality
  const [isReading, setIsReading] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const wordsRef = useRef<string[]>([]);
  const intervalRef = useRef<any>(null);
  const textToReadRef = useRef<string>("");
  
  // Map language codes to speech language options
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'rw': 'rw-RW' // Kinyarwanda
  };

  // Function to clear any ongoing reading
  const clearReading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    Speech.stop();
    setIsReading(false);
    setCurrentPosition(0);
    setCurrentSection("");
  };
  
  // Function to start reading a section
  const startReading = (sectionText: string, sectionId: string) => {
    // Clear any previous reading
    clearReading();
    
    if (!sectionText) return;
    
    // Update state with new section
    textToReadRef.current = sectionText;
    wordsRef.current = sectionText.split(' ');
    setCurrentSection(sectionId);
    
    // Configure speech options
    const speechOptions = {
      language: languageMap[currentLanguage] || 'en-US',
      pitch: 1.0,
      rate: 0.8,
      onStart: () => {
        setIsReading(true);
        setCurrentPosition(0);
        
        // Update the highlighted word position as speech progresses
        if (wordsRef.current.length > 0) {
          const avgWordDuration = (sectionText.length / wordsRef.current.length) * 50; // Estimate based on text length
          
          intervalRef.current = setInterval(() => {
            setCurrentPosition((prev: number) => {
              if (prev >= wordsRef.current.length - 1) {
                clearInterval(intervalRef.current);
                return prev;
              }
              return prev + 1;
            });
          }, avgWordDuration);
        }
      },
      onDone: () => {
        proceedToNextSection(sectionId); // Move to the next section when done
      },
      onError: clearReading,
      onStopped: clearReading
    };
    
    // Start speaking
    Speech.speak(sectionText, speechOptions);
  };

  const proceedToNextSection = (currentSectionId: string) => {
    if (currentSectionId === "symptoms" && data.diseaseTreatment) {
      startReading(data.diseaseTreatment, "treatment");
    } else if (currentSectionId === "treatment" && data.diseasePrevention) {
      startReading(data.diseasePrevention, "prevention");
    } else {
      clearReading(); // If no more sections, stop reading
    }
  };
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      clearReading();
    };
  }, []);
  
  // Function to toggle reading for a section
  const toggleReading = () => {
    if (isReading) {
      clearReading();
    } else {
      if (data.diseaseSymptoms) {
        startReading(data.diseaseSymptoms, "symptoms");
      } else if (data.diseaseTreatment) {
        startReading(data.diseaseTreatment, "treatment");
      } else if (data.diseasePrevention) {
        startReading(data.diseasePrevention, "prevention");
      }
    }
  };
  
  // Get common translatable UI text
  const uiText = {
    listen: t('diagnosis.listen'),
    handsFull: t('diagnosis.hands_full'),
    symptoms: t('diagnosis.symptopms'), // Note: This appears to be a typo in your original code
    treatment: t('diagnosis.treatment'),
    prevention: t('diagnosis.prevention'),
    pause: t('common.pause') || 'Pause',
    play: t('common.listen') || 'Listen',
  };
  
  // Component for a section with readable text
  const ReadableSection = ({ id, title, content, icon }: { id: string, title: string, content: string, icon:  keyof typeof MaterialCommunityIcons.glyphMap; }) => {
    const isActive = isReading && currentSection === id;
    
    return (
      <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}>
          <MaterialCommunityIcons name={icon} size={20} /> {title}
        </Text>
        
        <ReadableText
          text={content}
          style={{ marginTop: 5, color: "#666", lineHeight: 22 }}
          isReading={isActive}
          currentPosition={isActive ? currentPosition : 0}
          highlightColor={`${theme.colors.primary}30`}
          language={currentLanguage}
        />
      </View>
    );
  };
  
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
        <TouchableOpacity style={{ position: 'absolute', left: 20, zIndex: 10 }}>
          <MaterialCommunityIcons onPress={()=>router.back()} name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text 
          style={{ 
            fontSize: 20, 
            fontWeight: "bold", 
            color: theme.colors.text,
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 40 // Give space for the back button
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          { data && data.disease_status !== "unknown" ? `${data.cropName}: ${data.disease_status}` : t('diagnosis.unknown_disease') }
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
                  backgroundColor: '#f0f0f0',
                }}
              >
                <Image
                  source={{ uri: localImage }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                  key={`image-${localImage}`}
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

        { data && data.disease_status !== "unknown" ? (
          <>
            {/* Audio Control Section with Single Button */}
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
                <Text style={{ fontWeight: "bold", color: "#333" }}>{uiText.listen}</Text>
                <Text style={{ fontSize: 14, color: "#666" }}>{uiText.handsFull}</Text>
              </View>
              <TouchableOpacity onPress={() => {toggleReading()}}>
                <MaterialCommunityIcons 
                  name={isReading ? "pause-circle" : "play-circle"} 
                  size={32} 
                  color="#007AFF" 
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Content sections, now without individual control buttons */}
            {data.diseaseSymptoms && (
              <ReadableSection
                id="symptoms"
                title={uiText.symptoms}
                content={data.diseaseSymptoms}
                icon="clipboard-text"
              />
            )}

            {data.diseaseTreatment && (
              <ReadableSection
                id="treatment"
                title={uiText.treatment}
                content={data.diseaseTreatment}
                icon="leaf"
              />
            )}

            {data.diseasePrevention && (
              <ReadableSection
                id="prevention"
                title={uiText.prevention}
                content={data.diseasePrevention}
                icon="leaf"
              />
            )}
          </>
        ) : (
          // Improved unknown disease section with animations - unchanged
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
        )}
      </ScrollView>
    </View>
  );
};

export default DiagnosisResultScreen;