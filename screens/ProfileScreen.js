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

  // Fetch profile data
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

  // Delete profile
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
        setProfile(null); // Clear profile after deletion
      } else {
        Alert.alert("Error", data.error || "Failed to delete profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
    } finally {
      setDeleting(false);
    }
  };

  // Load profile on mount
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
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => navigation.navigate("AddUserScreen")}
        >
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profilePictureContainer}>
        {profile.profile_picture ? (
          <Image
            source={{ uri: profile.profile_picture }}
            style={styles.profilePicture}
          />
        ) : (
          <View style={styles.placeholderPicture}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
      </View>

      {/* Animation */}
      <LottieView
        source={require("./img/profile-animation.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{profile.name || "Not set"}</Text>

        <Text style={styles.label}>Interest:</Text>
        <Text style={styles.value}>{profile.interest || "Not set"}</Text>

        <Text style={styles.label}>More Info:</Text>
        <Text style={styles.value}>{profile.more_info || "Not set"}</Text>
      </View>

      {/* Buttons */}
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
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noProfileText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  profilePictureContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75, // Half of width/height for circle
    borderWidth: 3,
    borderColor: "#4caf50",
  },
  placeholderPicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ccc",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
  animation: {
    width: 120,
    height: 120,
  },
  profileInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
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
  buttonsContainer: {
    marginTop: 20,
    width: "100%",
  },
  button: {
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
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