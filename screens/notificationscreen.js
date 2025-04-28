import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import * as Animatable from "react-native-animatable";
import { Audio } from "expo-av";
import LottieView from "lottie-react-native"; // Import Lottie

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour décoder le token manuellement
  const decodeTokenManually = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.log("❌ Erreur de décodage manuel :", error);
      return {};
    }
  };

  const playNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/notification.mp3")
      );
      await sound.playAsync();
      console.log("✅ Son joué avec succès");
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("❌ Erreur lors de la lecture du son :", error);
    }
  };

  useEffect(() => {
    const getTokenAndUserId = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          const decodedToken = decodeTokenManually(storedToken);
          const decodedUserId = decodedToken.id || decodedToken.userId || decodedToken.sub;
          setUserId(decodedUserId);
        }
      } catch (error) {
        console.log("❌ Erreur lors de la récupération :", error);
      }
    };
    getTokenAndUserId();
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.8:3000/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Fixed string interpolation
        },
      });
      const result = await response.json();
      if (response.ok) {
        if (result.notifications.length > notifications.length) {
          playNotificationSound();
        }
        setNotifications(result.notifications || []);
      }
    } catch (error) {
      console.log("❌ Échec du rechargement :", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://192.168.1.8:3000/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.log("❌ Échec du marquage :", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://192.168.1.8:3000/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
      }
    } catch (error) {
      console.log("❌ Échec de la suppression :", error);
    }
  };

  useEffect(() => {
    if (token && userId) {
      fetchNotifications();
      const socket = io("http://192.168.1.8:3000", {
        auth: { token: token },
      });

      socket.on("connect", () => {
        socket.emit("join", userId);
      });

      socket.on("new-notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        playNotificationSound();
      });

      socket.on("notification-marked-as-read", (notificationId) => {
        setNotifications((prev) =>
          prev.map((notif) =>
            String(notif.id) === String(notificationId)
              ? { ...notif, is_read: true }
              : notif
          )
        );
      });

      socket.on("notification-deleted", (notificationId) => {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, userId]);

  return (
    <View style={styles.container}>
      {/* Lottie Background */}
      <LottieView
        source={require("./img/spacex.json")} 
        autoPlay
        loop
        style={styles.background}
      />
      {/* Overlay Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity
            onPress={fetchNotifications}
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
        {notifications.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            extraData={notifications}
            renderItem={({ item }) => (
              <Animatable.View
                animation="fadeInUp"
                duration={500}
                style={[
                  styles.notificationItem,
                  item.is_read ? styles.read : styles.unread,
                ]}
              >
                <Text style={styles.notificationText}>
                  {item.message || "Sans message"}
                </Text>
                <View style={styles.actions}>
                  {!item.is_read && (
                    <TouchableOpacity
                      onPress={() => markAsRead(item.id)}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>✔ Lire</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => deleteNotification(item.id)}
                    style={[styles.button, styles.deleteButton]}
                  >
                    <Text style={styles.buttonText}>❌ Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            )}
          />
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117", // Couleur de fond sombre
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  content: {
    flex: 1,
    padding: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  reloadButton: {
    backgroundColor: "#1f6feb",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#1f6feb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  reloadButtonDisabled: {
    backgroundColor: "#567edc",
  },
  reloadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  notificationItem: {
    backgroundColor: "#161b22",
    padding: 15,
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: "#58a6ff",
  },
  read: {
    borderLeftWidth: 4,
    borderLeftColor: "#30363d",
  },
  notificationText: {
    color: "#c9d1d9",
    fontSize: 16,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: "#238636",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#da3633",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#8b949e",
  },
});

export default NotificationsScreen;