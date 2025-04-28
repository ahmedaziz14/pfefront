import React, { useState, useEffect } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [moreInfo, setMoreInfo] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
      if (
        cameraStatus !== "granted" ||
        galleryStatus !== "granted" ||
        mediaLibraryStatus !== "granted"
      ) {
        Alert.alert(
          "Permission required",
          "Please allow access to camera, gallery, and media library in settings."
        );
      }
    })();
  }, []);

  const pickImages = async (source) => {
    try {
      if (source === "camera") {
        setCameraLoading(true);
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: false,
        });

        if (!result.canceled) {
          const asset = await MediaLibrary.createAssetAsync(result.assets[0].uri);
          await MediaLibrary.createAlbumAsync("AddUserPhotos", asset, false);
          Alert.alert("Succès", "Photo prise et enregistrée dans la galerie !");
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsMultipleSelection: true,
        });

        if (!result.canceled) {
          setImages((prevImages) => [...prevImages, ...result.assets]);
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Échec de la prise ou sélection d’image : " + error.message);
    } finally {
      if (source === "camera") {
        setCameraLoading(false);
      }
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      "Add Photo",
      images.length === 0 ? "The first photo will be your profile picture" : "Choose an option",
      [
        { text: "Take Photo", onPress: () => pickImages("camera") },
        { text: "Choose from Gallery", onPress: () => pickImages("gallery") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const deleteImage = (indexToDelete) => {
    Alert.alert(
      "Delete Photo",
      indexToDelete === 0
        ? "This will remove your profile picture. Are you sure?"
        : "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setImages(images.filter((_, index) => index !== indexToDelete));
          },
        },
      ]
    );
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("interest", interest.trim());
      formData.append("more_info", moreInfo.trim());

      images.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          name: `image-${index}.jpg`,
          type: "image/jpeg",
        });
      });

      const response = await fetch("http://192.168.1.8:3000/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message || "Profile updated successfully!", [
          { text: "OK", onPress: () => navigation.navigate("ProfileScreen") },
        ]);
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert(
        "Error",
        error.message || "Network request failed. Please check your connection or server status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Lottie Space Background */}
      <LottieView
        source={require("./img/spacex.json")} // Replace with your space Lottie file
        autoPlay
        loop
        style={styles.background}
      />
      {/* Content Overlay */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <LottieView
            source={require("./img/add-user-animation.json")}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Interest"
          placeholderTextColor="#aaa"
          value={interest}
          onChangeText={setInterest}
        />
        <TextInput
          style={styles.input}
          placeholder="More Info"
          placeholderTextColor="#aaa"
          value={moreInfo}
          onChangeText={setMoreInfo}
          multiline
        />

        <TouchableOpacity style={styles.photoPlaceholder} onPress={showPhotoOptions}>
          {cameraLoading ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : images.length > 0 ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: images[0].uri }} style={styles.photo} />
              <TouchableOpacity style={styles.deleteButtonMain} onPress={() => deleteImage(0)}>
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.photoText}>Add Profile Photo</Text>
          )}
        </TouchableOpacity>

        {images.length > 1 && (
          <FlatList
            data={images.slice(1)}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            renderItem={({ item, index }) => (
              <View style={styles.smallPhotoContainer}>
                <Image source={{ uri: item.uri }} style={styles.smallPhoto} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteImage(index + 1)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.photoList}
          />
        )}

        <TouchableOpacity
          style={[styles.button, (loading || cameraLoading) && { opacity: 0.6 }]}
          disabled={loading || cameraLoading}
          onPress={saveProfile}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2196F3", marginTop: 10 }]}
          onPress={() => navigation.navigate("ProfileScreen")}
        >
          <Text style={styles.buttonText}>Go to Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Fallback background
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0, // Behind content
  },
  content: {
    flexGrow: 1,
    padding: 20,
    zIndex: 1, // Above background
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  animation: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff", // White for contrast
    marginTop: 20,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    color: "#333", // Dark text for readability
  },
  photoPlaceholder: {
    backgroundColor: "#ddd",
    height: 120,
    width: 120,
    borderRadius: 60,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  photoText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  photoList: {
    alignItems: "center",
    marginBottom: 20,
  },
  smallPhotoContainer: {
    position: "relative",
    marginRight: 10,
  },
  smallPhoto: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  deleteButtonMain: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});