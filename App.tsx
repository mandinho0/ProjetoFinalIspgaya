import React, { useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Login from './app/screens/Login';
import QuestionnaireForm from './app/screens/QuestionnaireForm';
import SignUp from './app/screens/SignUp';
import ViewEvaluations from './app/screens/ViewEvaluations';
import ViewEvaluationDetail from './app/screens/ViewEvaluationDetail';
import EditEvaluation from './app/screens/EditEvaluation';
import MyAccount from './app/screens/MyAccount';
import EditProfile from './app/screens/EditProfile';
import { AuthProvider, useAuth } from './app/context/AuthContext'; // Certifique-se de importar o contexto corretamente
import { signOut as firebaseSignOut } from 'firebase/auth'; // Importe o método de logout do Firebase
import { FIREBASE_AUTH } from './firebase'; // Importe sua configuração do Firebase

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  QuestionnaireForm: undefined;
  ViewEvaluations: undefined;
  ViewEvaluationDetail: undefined;
  EditEvaluation: undefined;
  MyAccount: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MyAccountIcon() {
  const navigation = useNavigation();

  return (
    <View style={styles.iconContainer}>
      <Icon
        name="user"
        size={30}
        color="#fff"
        onPress={() => navigation.navigate('MyAccount' as never)}
      />
    </View>
  );
}

function SignOutButton() {
  const { setUser } = useAuth();
  const navigation = useNavigation();

  const signOut = () => {
    firebaseSignOut(FIREBASE_AUTH)
      .then(() => {
        setUser(null);
        navigation.navigate('Login' as never);
      })
      .catch((error) => console.error(error));
  };

  return <Button title="Sign Out" onPress={signOut} />;
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>('');

  const routeNameRef = React.useRef<string | undefined>();
  const navigationRef = React.useRef<NavigationContainerRef<RootStackParamList>>(null);

  const onStateChange = async () => {
    const previousRouteName = routeNameRef.current;
    if (navigationRef.current) {
      const currentRouteName = navigationRef.current.getCurrentRoute()?.name;

      if (previousRouteName !== currentRouteName) {
        setCurrentRoute(currentRouteName);
      }

      routeNameRef.current = currentRouteName;
    }
  };

  return (
    <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
      <AuthProvider>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <Stack.Navigator initialRouteName='Login'>
              <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
              <Stack.Screen name='SignUp' component={SignUp} options={{ headerShown: false }} />
              <Stack.Screen name='QuestionnaireForm' component={QuestionnaireForm} options={{ headerShown: false }} />
              <Stack.Screen name='ViewEvaluations' component={ViewEvaluations} options={{ headerShown: false }} />
              <Stack.Screen name='ViewEvaluationDetail' component={ViewEvaluationDetail} options={{ headerShown: false }} />
              <Stack.Screen name='EditEvaluation' component={EditEvaluation} options={{ headerShown: false }} />
              <Stack.Screen name='MyAccount' component={MyAccount} options={{ headerShown: false }} />
              <Stack.Screen name='EditProfile' component={EditProfile} options={{ headerShown: false }} />
            </Stack.Navigator>
            {(currentRoute !== 'Login' && currentRoute !== 'SignUp' && currentRoute !== 'MyAccount') && <MyAccountIcon />}
          </View>
        </TouchableWithoutFeedback>
        <StatusBar style="auto" />
      </AuthProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000115'
  },
  iconContainer: {
    position: 'absolute',
    top: 50,
    right: 30,
  }
});
