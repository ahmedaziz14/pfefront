import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for password confirmation
  const [productKey, setProductKey] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Validation checks
    if (!email || !password || !confirmPassword || !productKey) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://192.168.1.7:3000/Test/Tsignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, product_key: productKey }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert("Succès", "Compte créé avec succès !");
        navigation.navigate("Login"); // Navigate to Login after signup
      } else {
        Alert.alert("Erreur", data.error || "Échec de l'inscription");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Erreur", "Erreur réseau");
    }
  };

  return (
    <View style={styles.container}>
      {/* Lottie Space Background */}
      <LottieView
        source={require("./img/spacex.json")} 
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
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={[styles.input, email && styles.activeInput]}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, password && styles.activeInput]}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={[styles.input, confirmPassword && styles.activeInput]}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TextInput
          style={[styles.input, productKey && styles.activeInput]}
          placeholder="Product Key"
          placeholderTextColor="#aaa"
          value={productKey}
          onChangeText={setProductKey}
        />

        <TouchableOpacity
          style={[
            styles.button,
            email && password && confirmPassword && productKey && isValidEmail(email)
              ? styles.activeButton
              : { opacity: 0.6 },
          ]}
          onPress={handleSignup}
          disabled={loading || !email || !password || !confirmPassword || !productKey || !isValidEmail(email)}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <Text
          style={styles.link}
          onPress={() => navigation.navigate("Login")}
        >
          Already have an account? Sign In
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", 
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  
  },
  lottie: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, 
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    backgroundColor: "rgba(28, 28, 60, 0.9)", 
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
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#FF6F61",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
