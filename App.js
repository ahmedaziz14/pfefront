import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import UserListScreen from './screens/UsersListScreen';
import GetStartedScreen from './screens/GetStartedScreen';
import Navigation from './Navigation';
import AddUserScreen from './screens/AddUserScreen';
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        { <Navigation/> }
       
      </View>
    </GestureHandlerRootView>
  );
}

