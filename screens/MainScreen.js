import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MainScreen() {
  const [isLocked, setIsLocked] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
        {/* $username*/}
          Welcome      
        </Text>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://images.app.goo.gl/PuPnaD4uF2xDiutC8' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Animation Section */}
      <View style={styles.animationContainer}>
        <LottieView
          source={
            isLocked
              ? require('./img/locked.json') // Animation for locked state
              : require('./img/unlocked.json') // Animation for unlocked state
          }
          autoPlay
          loop={false}
          style={styles.animation}
        />
        <Text style={[styles.statusText, isDarkMode ? styles.darkText : styles.lightText]}>
          {isLocked ? 'Car is Locked' : 'Car is Unlocked'}
        </Text>
      </View>

      {/* Lock/Unlock Button */}
      <TouchableOpacity
        style={[styles.button, isLocked ? styles.lockButton : styles.unlockButton]}
        onPress={toggleLock}
      >
        <Text style={styles.buttonText}>{isLocked ? 'Unlock' : 'Lock'}</Text>
      </TouchableOpacity>

      {/* Status Icons */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Icon
            name="battery"
            size={30}
            color={isDarkMode ? '#ffffff' : '#333333'}
          />
          <Text style={[styles.statusText, isDarkMode ? styles.darkText : styles.lightText]}>
            85% Battery
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Icon
            name="gas-station"
            size={30}
            color={isDarkMode ? '#ffffff' : '#333333'}
          />
          <Text style={[styles.statusText, isDarkMode ? styles.darkText : styles.lightText]}>
            65% Fuel
          </Text>
        </View>
      </View>

      {/* Dark Mode Toggle */}
      <View style={styles.darkModeToggle}>
        <Text style={[styles.toggleText, isDarkMode ? styles.darkText : styles.lightText]}>
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  animation: {
    width: 150,
    height: 150,
  },
  statusText: {
    fontSize: 18,
    marginTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockButton: {
    backgroundColor: '#ff4d4d',
  },
  unlockButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statusItem: {
    alignItems: 'center',
  },
  darkModeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 18,
  },
  lightBackground: {
    backgroundColor: '#ffffff',
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  lightText: {
    color: '#333333',
  },
  darkText: {
    color: '#ffffff',
  },
});
