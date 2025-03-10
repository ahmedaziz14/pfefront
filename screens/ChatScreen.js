import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert('Error', 'No token found, please log in again.');
          navigation.replace('LoginScreen');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
        Alert.alert('Error', 'Failed to retrieve token.');
        navigation.replace('LoginScreen');
      }
    };
    getToken();
  }, [navigation]);

  useEffect(() => {
    if (!token) return;

    console.log('ChatScreen token:', token);

    const newSocket = io('http://192.168.1.10:3000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('User connected to WebSocket');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });

    newSocket.on('receiveMessage', (message) => {
      console.log('Received message via WebSocket:', message);
      setMessages((prev) => [...prev, message]); // Mise à jour immédiate de la liste
    });

    setSocket(newSocket);

    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        console.log('Fetching chat history...');
        const response = await fetch('http://192.168.1.10:3000/chat/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        console.log('Chat history response:', data);
        if (response.ok) {
          setMessages(data.messages || []);
        } else {
          console.error('Error fetching chat history:', data.error);
          setMessages([]);
        }
      } catch (error) {
        console.error('Fetch chat error:', error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChatHistory();

    return () => newSocket.disconnect();
  }, [token]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      console.log('Sending message...');
      const response = await fetch('http://192.168.1.10:3000/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
        }),
      });
      const data = await response.json();
      console.log('Send message response:', data);
      if (response.ok) {
        setNewMessage('');
      } else {
        console.error('Error sending message:', data.error);
        Alert.alert('Error', data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.is_admin ? styles.adminMessage : styles.userMessage]}>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with Admin</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4caf50" style={styles.loading} />
      ) : messages.length === 0 ? (
        <Text style={styles.emptyText}>No messages yet</Text>
      ) : (
        <FlatList
          data={[...messages].reverse()} // Inverser pour afficher les derniers messages en bas
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()} // Correction des clés
          inverted={true} // Pour que le dernier message apparaisse en bas directement
          contentContainerStyle={styles.chatList}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  chatList: {
    flexGrow: 1,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '80%',
  },
  adminMessage: {
    backgroundColor: '#ddd',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#4caf50',
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 12,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});
