import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Récupérer les informations du profil
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch("http://192.168.1.10:3000/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer le profil
  const deleteProfile = async () => {
    setDeleting(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch("http://192.168.1.10:3000/user/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Profile deleted successfully!");
        
      } else {
        Alert.alert("Error", data.error || "Failed to delete profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
    } finally {
      setDeleting(false);
    }
  };

  // Charger les informations du profil au montage du composant
  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noProfileText}>No profile found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Animation Lottie */}
      <LottieView
        source={require("./img/profile-animation.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Informations du profil */}
      <View style={styles.profileInfo}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{profile.name}</Text>

        <Text style={styles.label}>Interest:</Text>
        <Text style={styles.value}>{profile.interest}</Text>

        <Text style={styles.label}>More Info:</Text>
        <Text style={styles.value}>{profile.more_info}</Text>

        {/* Afficher les images */}
        {profile.image_urls && profile.image_urls.length > 0 && (
          <>
            <Text style={styles.label}>Photos:</Text>
            <ScrollView horizontal contentContainerStyle={styles.imagesContainer}>
              {profile.image_urls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.image} />
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {/* Boutons pour mettre à jour et supprimer le profil */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => navigation.navigate("AddUserScreen")}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={deleteProfile}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Delete Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noProfileText: {
    fontSize: 18,
    color: "#666",
  },
  animation: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
  },
  profileInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: "#4caf50",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});