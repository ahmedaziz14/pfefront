import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen';
import GetStartedScreen from './screens/GetStartedScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AddUserScreen from './screens/AddUserScreen';
import NotificationsScreen from './screens/notificationscreen';
import ProfileScreen from './screens/ProfileScreen';
const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash" // Set SplashScreen as the first screen
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name='AddUserScreen' component={AddUserScreen}/>   
        <Stack.Screen name='NotificationsScreen' component={NotificationsScreen}/>     
        <Stack.Screen name='ProfileScreen' component={ProfileScreen}/>         
      </Stack.Navigator>
    </NavigationContainer>
  );
}
