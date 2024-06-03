import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Login from './app/screens/Login';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
