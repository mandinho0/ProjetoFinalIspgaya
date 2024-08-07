// Login.js
import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, RefreshControl, Pressable } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/logoInova.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { setUser } = useAuth();
  const navigation = useNavigation(); 

  const navigateToSignUp = () => {
    navigation.navigate('SignUp' as never);
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(FIREBASE_DB, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let extendedUser = firebaseUser;

      if (userDoc.exists()) {
        const userData = userDoc.data();
        extendedUser = { ...firebaseUser, ...userData };
        console.log("Merged User Data on Login: ", extendedUser);
      }

      setUser(extendedUser);
      navigation.navigate('ViewEvaluations' as never);
    } catch (error) {
      console.log(error);
      alert('Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Pressable>
          <View style={styles.innerContainer}>
            <Image source={logo} style={styles.logo} />
            <TextInput
              value={email}
              style={styles.input}
              placeholder='Email'
              autoCapitalize='none'
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              secureTextEntry={true}
              value={password}
              style={styles.input}
              placeholder='Password'
              autoCapitalize='none'
              onChangeText={(text) => setPassword(text)}
            />

            {loading ? (
              <ActivityIndicator size='large' color='#0000ff' />
            ) : (
              <>
                <View style={styles.signInContainer}>
                  <TouchableOpacity style={styles.button} onPress={signIn}>
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.signUpContainer}>
                  <Text style={styles.text}>Not registered yet? </Text>
                  <TouchableOpacity style={styles.buttonSignUp} onPress={navigateToSignUp}>
                    <View style={styles.textWithUnderline}>
                      <Text style={styles.buttonSignUpText}>Click here</Text>
                      <View style={styles.underline} />
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000115',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  input: {
    marginVertical: 4,
    height: 50,
    width: 300,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 100,
    padding: 10,
    marginTop: 20,
    backgroundColor: '#fff',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 60,
  },
  button: {
    backgroundColor: '#dc801c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    width: 100,
  },
  buttonSignUp: {
    paddingLeft: 12
  },
  textWithUnderline: {
    alignItems: 'center',
  },
  buttonSignUpText: {
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: '#007bff',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
  },
});
