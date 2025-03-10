import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const navigation = useNavigation();

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token"); // Supprimer le token
    navigation.navigate("Login"); // Naviguer vers l'écran de connexion
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'écran d'accueil</Text>

      {/* Bouton pour NotificationsScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("NotificationsScreen")}
      >
        <LottieView
          source={require("./img/notifications.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>

      {/* Bouton pour ProfileScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ProfileScreen")}
      >
        <LottieView
          source={require("./img/profile.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.buttonText}>Profil</Text>
      </TouchableOpacity>

      {/* Bouton pour AddUserScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AddUserScreen")}
      >
        <LottieView
          source={require("./img/add-user.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.buttonText}>Ajouter un utilisateur</Text>
      </TouchableOpacity>

      {/* Bouton pour GPSScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MapScreen")}
      >
        <LottieView
          source={require("./img/gps.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.buttonText}>GPS</Text>
      </TouchableOpacity>

      {/* Bouton pour ParametreScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ChatScreen")}
      >
        <LottieView
          source={require("./img/chat.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.buttonText}>Help!</Text>
      </TouchableOpacity>

      {/* Bouton pour Logout */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <LottieView
          source={require("./img/logout.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#2196F3",
  },
});

export default HomeScreen;