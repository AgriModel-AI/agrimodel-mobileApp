import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from '@/hooks/ThemeProvider';
import { router } from 'expo-router'; // Import the router
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunities } from '@/redux/slices/communitySlice';

interface Community {
  id: string;
  name: string;
}

const CreatePost: React.FC = () => {
  const { theme } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);


  const { t } = useTranslation();
  const dispatch = useDispatch<any>();

  const { communities, loading: loadingCommunity , hasFetched: communitesHasFetched} = useSelector((state: any) => state.communites);

  useEffect(() => {
    if (!communitesHasFetched) {
      dispatch(fetchCommunities());
    }
  }, [communitesHasFetched, dispatch]);

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

  const handlePost = () => {
    if (!selectedCommunity) {
      Alert.alert('Error', 'Please select a community to post in.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    // Handle the post creation logic here
    Alert.alert('Success', 'Your post has been created successfully!');
    setImage(null);
    setDescription('');
    setSelectedCommunity('');
  };

  const closeModal = () => {
    router.back(); // This will close the modal screen by navigating back
  };

  return (
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
        items={communities.map((community: any) => ({ label: community.name, value: community.communityId }))}
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
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handlePost}>
        <Text style={styles.buttonText}>{ t('createPost.post') }</Text>
      </TouchableOpacity>
    </View>
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
