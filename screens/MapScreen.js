import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import jwtDecode from "jwt-decode";
import { WebView } from "react-native-webview";

const MapScreen = () => {
  const [locations, setLocations] = useState([]);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const webviewRef = useRef(null);

  // Récupérer le token et l'userId
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
        } else {
          console.log("⚠️ Aucun token trouvé dans AsyncStorage");
        }
      } catch (error) {
        console.log("❌ Erreur lors de la récupération ou décodage du token :", error);
      }
    };
    getTokenAndUserId();
  }, []);

  // Récupérer les localisations depuis l'API
  const fetchLocations = async () => {
    if (!token) {
      console.log("⚠️ Token manquant pour fetchLocations");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.10:3000/locations", {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        console.log("📍 Localisations récupérées :", result.locations);
        setLocations(result.locations || []);
        updateMap(result.locations || []);
      } else {
        console.log("❌ Erreur récupération :", result.error);
      }
    } catch (error) {
      console.log("❌ Échec rechargement :", error);
    } finally {
      setLoading(false);
    }
  };

  // Configurer WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    if (token && userId) {
      fetchLocations();
      const socket = io("http://192.168.1.10:3000");
      socket.on("connect", () => {
        console.log("✅ Connecté au WebSocket");
        socket.emit("join", userId);
      });
      socket.on("new-location", (location) => {
        console.log("📍 Nouvelle localisation reçue :", location);
        setLocations((prev) => [location, ...prev]);
        updateMap([location]);
      });
      socket.on("disconnect", () => console.log("⚠️ Déconnecté du WebSocket"));
      return () => {
        socket.off("new-location");
        socket.disconnect();
      };
    }
  }, [token, userId]);

  // Mettre à jour la carte avec les nouvelles localisations
  const updateMap = (newLocations) => {
    if (webviewRef.current) {
      const script = `
        var markers = ${JSON.stringify(newLocations)}.map(loc => 
          L.marker([loc.lat, loc.lng]).bindPopup('Produit: ' + loc.product_key + '<br>Ajouté: ' + new Date(loc.created_at).toLocaleString())
        );
        markers.forEach(marker => marker.addTo(map));
        if (markers.length > 0) {
          map.setView([${newLocations[0].lat}, ${newLocations[0].lng}], 10);
        }
      `;
      webviewRef.current.injectJavaScript(script);
    } else {
      console.log("⚠️ WebView non prête pour injecter le script");
    }
  };

  // HTML pour la carte Leaflet
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Map</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        var map = L.map('map').setView([48.8566, 2.3522], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carte des Localisations</Text>
        <TouchableOpacity
          onPress={fetchLocations}
          style={[styles.reloadButton, loading && styles.reloadButtonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.reloadText}>Recharger</Text>
          )}
        </TouchableOpacity>
      </View>
      <WebView
        ref={webviewRef}
        source={{ html: htmlContent }}
        style={styles.map}
        onLoadEnd={() => fetchLocations()} // Charge les localisations après rendu
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  reloadButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  reloadButtonDisabled: { backgroundColor: "#a5d6a7" },
  reloadText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  map: { flex: 1 },
});

export default MapScreen;