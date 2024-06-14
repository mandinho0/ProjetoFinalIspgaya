import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import logo from '../../assets/logoInova.jpg';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isBackButtonVisible, setIsBackButtonVisible] = useState(true);

  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  const handleEmailFocus = () => {
    setIsEmailFocused(true);
    setIsBackButtonVisible(false);
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
    setIsBackButtonVisible(false);
  };

  const handleConfirmPasswordFocus = () => {
    setIsConfirmPasswordFocused(true);
    setIsBackButtonVisible(false);
  };

  const handleEmailBlur = () => {
    setIsEmailFocused(false);
    setIsBackButtonVisible(true);
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
    setIsBackButtonVisible(true);
  };

  const handleConfirmPasswordBlur = () => {
    setIsConfirmPasswordFocused(false);
    setIsBackButtonVisible(true);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const signUp = async () => {
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPassword('');
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setEmailError('Email already registered');
        setLoading(false);
        return;
      }
      
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Account created successfully!');
    } catch (error) {
      console.log(error);
      alert('Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (confirmPassword && text !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (password && text !== password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (validateEmail(text)) {
      setEmailError('');
    } else {
      setEmailError('Invalid email format');
    }
  };

  const [inputStyles, setInputStyles] = useState({
    input: styles.input,
    inputError: styles.inputError,
    inputFocused: styles.inputFocused
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setInputStyles({
        input: styles.input,
        inputError: styles.inputError,
        inputFocused: styles.inputFocused
      });
    }, 100); // Delay to ensure styles are reapplied

    return () => clearTimeout(timer);
  }, [isPasswordFocused, isConfirmPasswordFocused]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <Image source={logo} style={styles.logo} />
          <TextInput
            value={email}
            style={[inputStyles.input, emailError ? inputStyles.inputError : null]}
            placeholder='New Email'
            autoCapitalize='none'
            onChangeText={handleEmailChange}
            onFocus={handleEmailFocus}
            onBlur={handleEmailBlur}
          />
          {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}
          <TextInput
            secureTextEntry={true}
            value={password}
            style={[inputStyles.input, isPasswordFocused ? inputStyles.inputFocused : inputStyles.inputFocused]}
            placeholder='New Password'
            autoCapitalize='none'
            onChangeText={handlePasswordChange}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
          />
          <TextInput
            secureTextEntry={true}
            value={confirmPassword}
            style={[inputStyles.input, passwordError ? inputStyles.inputError : null, isConfirmPasswordFocused ? inputStyles.inputFocused : inputStyles.inputFocused]}
            placeholder='Confirm New Password'
            autoCapitalize='none'
            onChangeText={handleConfirmPasswordChange}
            onFocus={handleConfirmPasswordFocus}
            onBlur={handleConfirmPasswordBlur}
          />
          {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}

          {loading ? (
            <ActivityIndicator size='large' color='#0000ff' />
          ) : (
            <>
              <View style={styles.signInContainer}>
                <TouchableOpacity style={styles.button} onPress={signUp}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              </View>
              {isBackButtonVisible && (
                <View style={styles.backButtonContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000115',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
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
    width: 250,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 30,
    alignSelf: 'center',
    padding: 10,
    marginTop: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  inputError: {
    borderColor: 'red',
  },
  inputFocused: {
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden'
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 32,
    width: '100%',
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#e66701',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '30%',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '100%',
  },
  buttonSignUp: {
    paddingLeft: 12,
  },
  backButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
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
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 5,
  },
});
