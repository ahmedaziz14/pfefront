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
    <View style={styles.container}>
      {/* Background animé avec Lottie */}
      <LottieView
        source={require("./img/spacex.json")} // 🔹 Remplace par ton fichier Lottie
        autoPlay
        loop
        style={styles.backgroundAnimation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bienvenue sur l'écran d'accueil</Text>

        {/* Boutons avec animations */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("NotificationsScreen")}>
          <LottieView source={require("./img/notifications.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.buttonText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ProfileScreen")}>
          <LottieView source={require("./img/profile.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.buttonText}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("AddUserScreen")}>
          <LottieView source={require("./img/add-user.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.buttonText}>Ajouter un utilisateur</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MapScreen")}>
          <LottieView source={require("./img/gps.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.buttonText}>GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ChatScreen")}>
          <LottieView source={require("./img/chat.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.buttonText}>Help!</Text>
        </TouchableOpacity>

        {/* Bouton Logout */}
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <LottieView source={require("./img/logout.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.buttonText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Fond noir pour un effet spatial
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  button: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
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
    color: "#00d4ff",
  },
});

export default HomeScreen;
