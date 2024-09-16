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
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore'; 
import { FIREBASE_AUTH } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import logo from '../assets/logoInova.jpg';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Enterprise } from '../../types';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [enterpriseError, setEnterpriseError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>('');
  const auth = FIREBASE_AUTH;
  const firestore = getFirestore();
  const navigation = useNavigation();

  const navigateToHomePage = () => {
    navigation.navigate('ViewEvaluations' as never);
  };

  const validateFields = () => {
    let isValid = true;

    if (!firstName.trim()) {
      alert('First name is required');
      return false;
    }

    if (!lastName.trim()) {
      alert('Last name is required');
      return false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      return false;
    } else if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    if (!selectedEnterprise) {
      setEnterpriseError('Please select an enterprise');
      return false;
    }

    return true;
  };

  const signUp = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setEmailError('Email already registered');
        setLoading(false);
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(firestore, 'users', user.uid), {
        firstName,
        lastName,
        email,
        userId: user.uid,
        enterpriseId: selectedEnterprise,
        role: 'user'
      });

      navigateToHomePage();
      alert('Account created successfully!');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already in use');
      } else {
        alert('Error creating account');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const fetchEnterprises = async () => {
      const enterprisesCollection = collection(firestore, 'enterprises');
      const enterprisesSnapshot = await getDocs(enterprisesCollection);
      const enterprisesList: Enterprise[] = enterprisesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setEnterprises(enterprisesList);
    };
  
    fetchEnterprises();
  }, []);

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

          <Text style={styles.text}>Enterprise</Text>
          <Dropdown
            data={enterprises.map((enterprise) => ({ label: enterprise.nome, value: enterprise.id }))}
            labelField="label"
            valueField="value"
            placeholder="Select a company"
            value={selectedEnterprise}
            onChange={item => {
              setSelectedEnterprise(item.value);
              setEnterpriseError('');
            }}
            style={styles.dropdown}
          />
          {enterpriseError ? <Text style={styles.errorMessage}>{enterpriseError}</Text> : null}

          <Text style={styles.text}>Name</Text>
          <TextInput
            value={firstName}
            style={styles.input}
            placeholder='First Name'
            autoCapitalize='none'
            onChangeText={(text) => setFirstName(text)}
          />
          <TextInput
            value={lastName}
            style={styles.input}
            placeholder='Last Name'
            autoCapitalize='none'
            onChangeText={(text) => setLastName(text)}
          />

          <Text style={styles.text}>Email</Text>
          <TextInput
            value={email}
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder='New Email'
            autoCapitalize='none'
            onChangeText={handleEmailChange}
          />
          {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}

          <Text style={styles.text}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!showPassword}
              value={password}
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder='New Password'
              autoCapitalize='none'
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!showPassword}
              value={confirmPassword}
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder='Confirm New Password'
              autoCapitalize='none'
              onChangeText={handleConfirmPasswordChange}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}

          {loading ? (
            <ActivityIndicator size='large' color='#0000ff' />
          ) : (
            <View style={styles.signInContainer}>
              <TouchableOpacity style={styles.button} onPress={signUp}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
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
  dropdown: {
    height: 50,
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 40,
    marginTop: 4
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
    marginBottom: 20,
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
    marginTop: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    paddingHorizontal: 60 
  },
  inputError: {
    borderColor: 'red',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    top: 13,
    padding: 10,
  },
  signInContainer: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#e66701',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '30%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 22
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 5,
  },
});
