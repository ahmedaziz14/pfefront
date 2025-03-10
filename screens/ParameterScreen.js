import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode"; // Identique à NotificationsScreen
import LottieView from "lottie-react-native";

const ParameterScreen = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState("10");
  const [selectedServices, setSelectedServices] = useState(["weather", "traffic"]);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("fr");

  // Récupérer le token et l'userId (identique à NotificationsScreen)
  useEffect(() => {
    const getTokenAndUserId = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          const decodedToken = jwtDecode(storedToken);
          const decodedUserId = decodedToken.userId || decodedToken.id || decodedToken.sub;
          setUserId(decodedUserId);
          console.log("🔑 User ID extrait :", decodedUserId);
          await loadSettings(decodedUserId, storedToken); // Charger les paramètres après avoir userId
        }
      } catch (error) {
        console.log("❌ Erreur lors de la récupération ou décodage du token :", error);
      } finally {
        setIsInitializing(false);
      }
    };
    getTokenAndUserId();
  }, []);

  const loadSettings = async (userId, token) => {
    try {
      const storedSettings = await AsyncStorage.getItem("userSettings");
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setPushNotifications(settings.pushNotifications ?? true);
        setUpdateFrequency(settings.updateFrequency ?? "10");
        setSelectedServices(settings.selectedServices ?? ["weather", "traffic"]);
        setTheme(settings.theme ?? "light");
        setLanguage(settings.language ?? "fr");
        console.log("⚙️ Paramètres chargés depuis AsyncStorage :", settings);
      } else {
        const response = await fetch("http://192.168.1.10:3000/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (response.ok && result.settings) {
          const settings = result.settings;
          setPushNotifications(settings.pushNotifications ?? true);
          setUpdateFrequency(settings.updateFrequency ?? "10");
          setSelectedServices(settings.selectedServices ?? ["weather", "traffic"]);
          setTheme(settings.theme ?? "light");
          setLanguage(settings.language ?? "fr");
          await AsyncStorage.setItem("userSettings", JSON.stringify(settings));
          console.log("⚙️ Paramètres chargés depuis le serveur :", settings);
        } else {
          console.log("❌ Erreur lors de la récupération des paramètres :", result.error);
        }
      }
    } catch (error) {
      console.log("❌ Échec du chargement des paramètres :", error);
    }
  };

  const saveSettings = async () => {
    if (!token || !userId) {
      Alert.alert("Erreur", "Utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }
    setLoading(true);
    try {
      const settings = {
        pushNotifications,
        updateFrequency,
        selectedServices,
        theme,
        language,
      };
      await AsyncStorage.setItem("userSettings", JSON.stringify(settings));
      console.log("✅ Paramètres sauvegardés localement :", settings);

      const response = await fetch("http://192.168.1.10:3000/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });
      const result = await response.json();

      if (response.ok) {
        console.log("✅ Paramètres synchronisés avec le serveur :", result);
        setLoading(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        console.log("❌ Erreur lors de la synchronisation :", result.error);
        Alert.alert("Erreur", "Échec de la synchronisation avec le serveur.");
      }
    } catch (error) {
      console.log("❌ Échec de la sauvegarde des paramètres :", error);
      Alert.alert("Erreur", "Échec de la sauvegarde des paramètres.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('./img/loading.json')}
            autoPlay
            loop
            style={styles.lottieLoading}
          />
          <Text style={styles.loadingText}>Chargement des paramètres...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Paramètres</Text>

          {/* Section Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>

            <View style={styles.option}>
              <Text style={styles.optionText}>Notifications Push</Text>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={pushNotifications ? "#2196F3" : "#f4f3f4"}
              />
            </View>

            <View style={styles.option}>
              <Text style={styles.optionText}>Fréquence des Mises à Jour</Text>
              <Picker
                selectedValue={updateFrequency}
                style={styles.picker}
                onValueChange={(itemValue) => setUpdateFrequency(itemValue)}
              >
                <Picker.Item label="5 secondes" value="5" />
                <Picker.Item label="10 secondes" value="10" />
                <Picker.Item label="30 secondes" value="30" />
              </Picker>
            </View>

            <View style={styles.option}>
              <Text style={styles.optionText}>Services Actifs</Text>
              <TouchableOpacity onPress={() => Alert.alert("Sélection", "À implémenter : sélection multi-services")}>
                <Text style={styles.subText}>{selectedServices.join(", ")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Préférences Générales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Préférences Générales</Text>

            <View style={styles.option}>
              <Text style={styles.optionText}>Thème</Text>
              <Picker
                selectedValue={theme}
                style={styles.picker}
                onValueChange={(itemValue) => setTheme(itemValue)}
              >
                <Picker.Item label="Clair" value="light" />
                <Picker.Item label="Sombre" value="dark" />
              </Picker>
            </View>

            <View style={styles.option}>
              <Text style={styles.optionText}>Langue</Text>
              <Picker
                selectedValue={language}
                style={styles.picker}
                onValueChange={(itemValue) => setLanguage(itemValue)}
              >
                <Picker.Item label="Français" value="fr" />
                <Picker.Item label="Arabe" value="ar" />
                <Picker.Item label="Anglais" value="en" />
              </Picker>
            </View>
          </View>

          {/* Bouton Sauvegarder avec Animation */}
          <TouchableOpacity
            onPress={saveSettings}
            style={[styles.saveButton, (loading || !userId) && styles.saveButtonDisabled]}
            disabled={loading || !userId}
          >
            {loading ? (
              <LottieView
              source={require('./img/loading.json')}
                autoPlay
                loop
                style={styles.lottieLoading}
              />
            ) : (
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            )}
          </TouchableOpacity>

          {/* Animation de Succès */}
          {showSuccess && (
            <View style={styles.successOverlay}>
              <LottieView
               source={require('./img/success.json')}
                autoPlay
                loop={false}
                style={styles.lottieSuccess}
                onAnimationFinish={() => setShowSuccess(false)}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  picker: {
    width: 150,
    color: "#333",
  },
  subText: {
    color: "#666",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#81b0ff",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  lottieLoading: {
    width: 40,
    height: 40,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  lottieSuccess: {
    width: 150,
    height: 150,
  },
});

export default ParameterScreen;