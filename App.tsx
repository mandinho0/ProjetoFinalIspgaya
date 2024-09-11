import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, Button, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import Login from './app/screens/Login';
import SignUp from './app/screens/SignUp';
import MyAccount from './app/screens/MyAccount';
import EditUser from './app/screens/Users/EditUser';
import CreateEnterprise from './app/screens/Enterprises/CreateEnterprise';
import ViewEnterprises from './app/screens/Enterprises/ViewEnterprises';
import Form from './app/screens/Evaluations/CreateForm';
import ViewEvaluations from './app/screens/Evaluations/ViewEvaluations';
import ViewEvaluationDetail from './app/screens/Evaluations/ViewEvaluationDetail';
import EditEvaluation from './app/screens/Evaluations/EditEvaluation';
import EditEnterprise from './app/screens/Enterprises/EditEnterprise';
import AdminDashboard from './app/screens/AdminDashboard ';
import CreateForm from './app/screens/Evaluations/CreateForm';
import ViewUsers from './app/screens/Users/ViewUsers';
import { insertDataToFirestore } from './insertDefaultQuestions';
import { RootStackParamList } from './navigationTypes'; 
import { AuthProvider, useAuth } from './app/context/AuthContext';
import { signOut as firebaseSignOut } from 'firebase/auth'; 
import { FIREBASE_AUTH, FIREBASE_DB } from './firebase';
import { getDoc, doc } from 'firebase/firestore';

const Stack = createNativeStackNavigator<RootStackParamList>();

// function to insert on first time all questions
//insertDataToFirestore();

function MyAccountIcon() {
  const navigation = useNavigation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

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

  return <Button title="Logout" onPress={signOut} />;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');
  const [currentRoute, setCurrentRoute] = useState<string | undefined>('');
  const { user } = useAuth();
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

  useEffect(() => {
    const checkUserAuthentication = async () => {
      if (user) {
        try {
          const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          if (userData?.role === 'admin') {
            setInitialRoute('AdminDashboard');
          } else {
            setInitialRoute('ViewEvaluations');
          }
        } catch (error) {
          console.error("Error fetching user role: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        setInitialRoute('Login');
        setLoading(false);
      }
    };

    checkUserAuthentication();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
      <AuthProvider>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <Stack.Navigator initialRouteName={initialRoute}>
              <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
              <Stack.Screen name='SignUp' component={SignUp} options={{ headerShown: false }} />
              <Stack.Screen name='Form' component={Form} options={{ headerShown: false }} />
              <Stack.Screen name='CreateForm' component={CreateForm} options={{ headerShown: false }} />
              <Stack.Screen name='ViewEvaluations' component={ViewEvaluations} options={{ headerShown: false }} />
              <Stack.Screen name='ViewEvaluationDetail' component={ViewEvaluationDetail} options={{ headerShown: false }} />
              <Stack.Screen name='EditEvaluation' component={EditEvaluation} options={{ headerShown: false }} />
              <Stack.Screen name='MyAccount' component={MyAccount} options={{ headerShown: false }} />
              <Stack.Screen name="CreateEnterprise" component={CreateEnterprise} options={{ title: 'Create Enterprise', headerShown: false }} />
              <Stack.Screen name="ViewEnterprises" component={ViewEnterprises} options={{ title: 'All Enterprises', headerShown: false }} />
              <Stack.Screen name="EditEnterprise" component={EditEnterprise} options={{ title: 'Edit Enterprises', headerShown: false }} />
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin Dashboard', headerShown: false }} />
              <Stack.Screen name='EditUser' component={EditUser} options={{ headerShown: false }} />
              <Stack.Screen name='ViewUsers' component={ViewUsers} options={{ headerShown: false }} />
            </Stack.Navigator>
            {(currentRoute !== 'Login' && currentRoute !== 'SignUp' && currentRoute !== 'MyAccount' && currentRoute !== 'EditUser') && <MyAccountIcon />}
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
    backgroundColor: '#000115',
  },
  iconContainer: {
    position: 'absolute',
    top: 50,
    right: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000115',
  },
});