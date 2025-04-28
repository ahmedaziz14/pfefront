import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function SplashScreen({ navigation }) {
    useEffect(() => {
      const timer = setTimeout(() => {
        navigation.replace('GetStarted');
      }, 3000);
  
      return () => clearTimeout(timer); // Cleanup timer
    }, [navigation]);
  return (
    <View style={styles.container}>
      <LottieView
        source={require('./img/splash-car.json.json')} // Path to your animation
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Dark background for modern feel
  },
  animation: {
    width: 300,
    height: 300,
  },
});
