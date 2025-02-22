import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Camera } from 'expo-camera'; // Simplified import
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState('');
  const [interest, setInterest] = useState('');
  const [moreInfo, setMoreInfo] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && galleryStatus === 'granted');
      if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to the camera and photos.');
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        setImages([...images, { uri: photo.uri }]);
        setShowCamera(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error('Take picture error:', error);
      }
    }
  };

  const pickFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.cancelled) {
      setImages([...images, ...result.assets]);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => setShowCamera(true) },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('interest', interest);
      formData.append('more_info', moreInfo);
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          name: `image-${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      const response = await fetch('http://192.168.1.10:3000/user/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
      console.error('Save profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera or photos</Text>;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <LottieView
            source={require('./img/add-user-animation.json')}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Interest"
          placeholderTextColor="#666"
          value={interest}
          onChangeText={setInterest}
        />
        <TextInput
          style={styles.input}
          placeholder="More Info"
          placeholderTextColor="#666"
          value={moreInfo}
          onChangeText={setMoreInfo}
        />

        <TouchableOpacity style={styles.photoPlaceholder} onPress={showPhotoOptions}>
          {images.length > 0 ? (
            <Image source={{ uri: images[0].uri }} style={styles.photo} />
          ) : (
            <Text style={styles.photoText}>Add Photo</Text>
          )}
        </TouchableOpacity>

        {images.length > 1 && (
          <FlatList
            data={images.slice(1)}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            renderItem={({ item }) => (
              <Image source={{ uri: item.uri }} style={styles.smallPhoto} />
            )}
            contentContainerStyle={styles.photoList}
          />
        )}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          disabled={loading}
          onPress={saveProfile}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2196F3', marginTop: 10 }]}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.buttonText}>Go to Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            ref={cameraRef}
            type="back" // Simplified to string value
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cameraButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                <Text style={styles.cameraButtonText}>Take Picture</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  animation: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  photoPlaceholder: {
    backgroundColor: '#ddd',
    height: 120,
    width: 120,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  photoList: {
    alignItems: 'center',
    marginBottom: 20,
  },
  smallPhoto: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraButton: {
    padding: 15,
    backgroundColor: '#4caf50',
    borderRadius: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});