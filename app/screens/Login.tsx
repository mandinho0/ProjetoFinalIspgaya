// Login component
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation(); // Ensure this is within a screen component

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Homepage' as never); // Navigate to Homepage after successful sign-in
    } catch (error) {
      console.log(error);
      alert('Error signing in');
    } finally {
      setLoading(false);
    }
  }
  

  const signUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Account created successfully!');
    } catch (error) {
      console.log(error);
      alert('Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={signIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={signUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center'
  },
  input: {
    marginVertical: 4,
    height: 50,
    width: 200,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 100,
    alignSelf:'center',
    padding: 10,
    marginTop: 20,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    width: '40%', 
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
