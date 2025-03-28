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
      const response = await fetch("http://192.168.1.3:3000/notifications", {
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
        `http://192.168.1.3:3000/notifications/${notificationId}/read`,
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
        `http://192.168.1.3:3000/notifications/${notificationId}`,
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
      const socket = io("http://192.168.1.3:3000", {
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
        source={require("./img/spacex.json")} // Replace with your Lottie file
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
    backgroundColor: "#000", // Black background as fallback
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0, // Behind content
  },
  content: {
    flex: 1,
    padding: 20,
    zIndex: 1, // Above background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // White for contrast
  },
  reloadButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  reloadButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  reloadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationItem: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  read: {
    borderLeftWidth: 4,
    borderLeftColor: "#ccc",
  },
  notificationText: {
    color: "#333", // Dark text for readability
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#E53935",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#fff", // White for contrast
  },
});

export default NotificationsScreen;