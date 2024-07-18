// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Login from './app/screens/Login';
import Homepage from './app/screens/Homepage';
import QuestionnaireForm from './app/screens/QuestionnaireForm';
import SignUp from './app/screens/SignUp';
import ViewEvaluations from './app/screens/ViewEvaluations';
import ViewEvaluationDetail from './app/screens/ViewEvaluationDetail';
import EditEvaluation from './app/screens/EditEvaluation';
import { AuthProvider } from './app/context/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
            <NavigationContainer>
              <Stack.Navigator initialRouteName='Login'>
                <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
                <Stack.Screen name='SignUp' component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name='Homepage' component={Homepage} options={{ headerShown: false }} />
                <Stack.Screen name='QuestionnaireForm' component={QuestionnaireForm} options={{ headerShown: false }} />
                <Stack.Screen name='ViewEvaluations' component={ViewEvaluations} options={{ headerShown: false }} />
                <Stack.Screen name='ViewEvaluationDetail' component={ViewEvaluationDetail} options={{ headerShown: false }} />
                <Stack.Screen name='EditEvaluation' component={EditEvaluation} options={{ headerShown: false }} />
              </Stack.Navigator>
            </NavigationContainer>
          <StatusBar style="auto" />
        </View>
      </TouchableWithoutFeedback>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
