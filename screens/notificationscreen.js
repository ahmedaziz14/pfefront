import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');

    try {
      const response = await fetch('http://192.168.1.4:3000/notifications/not', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      console.log("Notifications reçues :", data);

      if (!Array.isArray(data)) {
        throw new Error("Les données reçues ne sont pas un tableau.");
      }

      setNotifications(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error);
      Alert.alert('Erreur', 'Impossible de récupérer les notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (product_key) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch('http://192.168.1.4:3000/notifications/not', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_key })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour.");
      }

      fetchNotifications();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer comme lu.');
    }
  };

  const deleteNotification = async (product_key) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch('http://192.168.1.4:3000/notifications/not', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_key })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression.");
      }

      fetchNotifications();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la notification.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF6F61" />
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>Aucune notification pour le moment.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()} // 🔹 Évite undefined
          renderItem={({ item }) => (
            item && (
              <View style={styles.notificationCard}>
                <Text style={styles.notificationText}>{item.message || "Notification sans message"}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => markAsRead(item.product_key)}>
                    <Text style={styles.markAsRead}>✔ Marquer comme lu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteNotification(item.product_key)}>
                    <Text style={styles.delete}>❌ Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0c29', padding: 20 },
  emptyText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20 },
  notificationCard: { backgroundColor: '#1c1c3c', padding: 15, borderRadius: 10, marginBottom: 10 },
  notificationText: { color: '#fff', fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  markAsRead: { color: '#FF6F61', fontWeight: 'bold' },
  delete: { color: '#ff4444', fontWeight: 'bold' }
});

export default NotificationsScreen;
