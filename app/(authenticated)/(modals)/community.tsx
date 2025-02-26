import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from '@/hooks/ThemeProvider';
import { router } from 'expo-router'; // Import the router
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunities } from '@/redux/slices/communitySlice';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import showToast from '@/component/showToast';
import { createPost } from '@/redux/slices/postsSlice';

const CreatePost: React.FC = () => {
  const { theme } = useTheme();
  const [image, setImage] = useState<any>(null);
  const [description, setDescription] = useState<string>('');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const { t } = useTranslation();
  const dispatch = useDispatch<any>();

  const { communities, loading: loadingCommunity , hasFetched: communitesHasFetched} = useSelector((state: any) => state.communites);

  useEffect(() => {
    if (!communitesHasFetched) {
      dispatch(fetchCommunities());
    }
  }, [communitesHasFetched, dispatch]);

  console.log(communities)


  const createFormDataWithImage = () => {
    const data = new FormData();
    
    data.append("content", description);

    const filename = image.split('/').pop() || 'photo.jpg';
    
    // Infer the type from the extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    data.append("image", {
      uri: image,
      name: filename,
      type: type,
    } as any);
  
    return data;
  };


  const validateInputs = () => {
    if (!image) {
      Alert.alert(t('createPost.pleaseUploadImage'));
      return false;
    }
    if (!selectedCommunity) {
      Alert.alert(t('createPost.pleaseSelectCommunity'));
      return false;
    }
    if (!description.trim()) {
      Alert.alert(t('createPost.pleaseEnterDescription'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
  
    setLoading(true);
    buttonScale.value = withTiming(0.95, { duration: 200 });
  
    const formData = createFormDataWithImage();
  
    dispatch(createPost({ "communityId": selectedCommunity, "postData": formData }))
      .unwrap()
      .then(() => {
        Alert.alert(t('createPost.postSuccess'));
        setImage(null);
        setDescription('');
        setSelectedCommunity('');
      })
      .catch((error: any) => {
        const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
        Alert.alert(errorMessage);
      })
      .finally(() => {
        setLoading(false);
        buttonScale.value = withTiming(1, { duration: 200 });
      });
  };
  


  const buttonScale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const closeModal = () => {
    router.back(); // This will close the modal screen by navigating back
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingBottom: 20 }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{ t('createPost.title') }</Text>

          {/* Close Modal Button */}
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{ t('createPost.close') }</Text>
          </TouchableOpacity>
        </View>
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>{ t('createPost.uploadImage') }</Text>
          )}
        </TouchableOpacity>

        {/* Description Input */}
        <TextInput
          style={[styles.input, { color: 'black' }]}
          placeholder={ t('createPost.description') }
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="black"
        />

        {/* Community Picker (Using Dropdown Picker) */}
        <DropDownPicker
          open={open}
          value={value}
          items={communities.filter((community: any) => community.joined === true).map((community: any) => ({ label: community.name, value: community.communityId }))}
          setOpen={setOpen}
          setValue={setValue}
          placeholder={ t('createPost.selectCommunity') }
          containerStyle={styles.dropdownContainer}
          style={[styles.dropdownStyle]} // Customize dropdown styling
          onChangeValue={val => {
            setSelectedCommunity(val || '');
          }}
        />

        {/* Submit Button */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity disabled={loading} style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{ t('createPost.post') }</Text> }
          </TouchableOpacity>
        </Animated.View>
        
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row', // Align title and close button side by side
    justifyContent: 'space-between', // Space out title and button
    alignItems: 'center', // Vertically center both
    marginBottom: 20, // Add space below header
    paddingHorizontal: 10, // Add horizontal padding to ensure enough space for close button
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingRight: 5,
    marginRight: 6
  },
  closeButton: {
    position: 'absolute', // Position the button absolutely
    right: 0, // Align it to the right side
    top: 0, // Align it to the top
    padding: 10,
    alignItems: 'center',
    zIndex: 1,
    marginLeft: 5
  },
  closeButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#666',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    width: '100%',
    minHeight: 120,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dropdownStyle: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePost;
