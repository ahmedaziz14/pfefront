import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://192.168.1.8:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        Alert.alert("Succès", "Connexion réussie !");
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert("Erreur", data.error || "Problème de connexion.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Erreur", "Problème de connexion au serveur.");
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
      <View style={styles.content}>
        <LottieView
          source={require("./img/login-car.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={[styles.input, email && styles.activeInput]}
          placeholder="Email"
          placeholderTextColor="#aaa"
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          style={[styles.input, password && styles.activeInput]}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity
          style={[
            styles.button,
            email && password && isValidEmail(email)
              ? styles.activeButton
              : { opacity: 0.6 },
          ]}
          disabled={loading || !email || !password || !isValidEmail(email)}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Sign In"}
          </Text>
        </TouchableOpacity>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate("Signup")}
        >
          Don't have an account? Sign Up
        </Text>
      </View>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // Above background
  },
  lottie: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: "#fff", // White for contrast
    marginBottom: 20,
  },
  input: {
    width: "80%",
    backgroundColor: "rgba(28, 28, 60, 0.9)", // Slightly transparent for depth
    borderRadius: 8,
    padding: 15,
    color: "#fff",
    marginVertical: 10,
    fontSize: 16,
  },
  activeInput: {
    borderColor: "#FF6F61",
    borderWidth: 1,
  },
  button: {
    width: "80%",
    backgroundColor: "#444",
    padding: 15,
    borderRadius: 50,
    marginVertical: 10,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activeButton: {
    backgroundColor: "#FF6F61",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  link: {
    color: "#FF6F61",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
