// Login component
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import logo from '../../assets/logoInova.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation(); 
  const navigateToSignUp = () => {
    navigation.navigate('SignUp' as never); // Defina este nome com base no seu roteamento
  };

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
                <Text style={styles.buttonSignUpText}>Sign Up here</Text>
                <View style={styles.underline} />
              </View>
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
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#000115'
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 40,
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center'
  },
  button: {
    backgroundColor: '#dc801c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    width: '30%', 
  },
  buttonSignUp: {
    paddingLeft: 12,
    textDecorationLine: 'underline',
    textDecorationColor:'white'
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
