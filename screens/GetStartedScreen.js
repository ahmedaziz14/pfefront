import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

export default function GetStartedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Background animé avec Lottie */}
      <LottieView
        source={require("./img/spacex.json")} // 🔹 Remplace par ton fichier Lottie
        autoPlay
        loop
        style={styles.backgroundAnimation}
      />

      {/* Contenu principal */}
      <LottieView
        source={require("./img/login-car.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.title}>Welcome to CarApp</Text>
      <Text style={styles.subtitle}>
        Unlock the future with your car in one tap.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  lottie: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#d1d1d1",
    textAlign: "center",
    marginHorizontal: 40,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF6F61",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    shadowColor: "#FF6F61",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
