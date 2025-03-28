import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GeminiScreen({ navigation }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(); // Use useRef instead of this.scrollView

  // Send message to Gemini
  const sendMessageToGemini = useCallback(async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://192.168.1.3:3000/gemini/geminchat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok) {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { user: message, gemini: data.reply },
        ]);
        setMessage(""); // Clear input after sending
      } else {
        Alert.alert("Error", data.error || "Failed to chat with Gemini.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  }, [message]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef} // Assign ref correctly
        style={styles.chatHistory}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {chatHistory.length === 0 ? (
          <Text style={styles.noMessages}>Start chatting with Gemini!</Text>
        ) : (
          chatHistory.map((chat, index) => (
            <View key={index} style={styles.messageContainer}>
              <Text style={styles.userMessage}>You: {chat.user}</Text>
              <Text style={styles.geminiMessage}>Gemini: {chat.gemini}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          multiline
          onSubmitEditing={sendMessageToGemini}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendMessageToGemini}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatHistory: {
    flex: 1,
    padding: 15,
  },
  chatContent: {
    paddingBottom: 20,
  },
  noMessages: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    maxWidth: "80%",
    marginBottom: 5,
  },
  geminiMessage: {
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
