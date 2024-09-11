import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, doc, getDoc, getDocs, updateDoc, getFirestore } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../firebase'; 
import { Dropdown } from 'react-native-element-dropdown'; 
import { useAuth } from '../../context/AuthContext';
import { Enterprise } from '../../../types';

interface RouteParams {
  userId: string;
}

export default function EditUser() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [enterpriseId, setEnterpriseId] = useState<string>(''); // Adicionar estado para a empresa
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as RouteParams;
  const firestore = getFirestore();

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData?.firstName || '');
          setLastName(userData?.lastName || '');
          setEmail(userData?.email || '');
          setRole(userData?.role || 'user');
          setEnterpriseId(userData?.enterpriseId || ''); // Carregar a empresa associada ao usuário
        } else {
          Alert.alert('Error', 'User not found.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while fetching user data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSave = async () => {
    if (!firstName || !lastName || !email || (!enterpriseId && isAdmin)) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(FIREBASE_DB, 'users', userId), {
        firstName,
        lastName,
        email,
        role,
        enterpriseId, // Salvar a empresa editada, se for admin
      });
      Alert.alert('Success', 'User information updated successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating user data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit User</Text>
      
      <Text style={{ color: 'white', paddingBottom: 12 }}>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      
      <Text style={{ color: 'white', paddingBottom: 12 }}>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      
      <Text style={{ color: 'white', paddingBottom: 12 }}>Email</Text>
      <TextInput
        style={styles.inputEmail}
        placeholder="Email"
        value={email}
        editable={false}
        keyboardType="email-address"
      />

      <Text style={{ color: 'white', paddingBottom: 12 }}>Role</Text>
      {isAdmin ? (
        <Dropdown
          style={styles.dropdown}
          data={[
            { label: 'Admin', value: 'admin' },
            { label: 'Manager', value: 'manager' },
            { label: 'User', value: 'user' }
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select role"
          value={role}
          onChange={item => setRole(item.value)}
        />
      ) : (
        <TextInput style={styles.inputEmail}>{role}</TextInput>
      )}

      <Text style={{ color: 'white', paddingBottom: 12 }}>Enterprise</Text>
      {isAdmin ? (
        <Dropdown
          style={styles.dropdown}
          data={enterprises.map((enterprise) => ({
            label: enterprise.nome,
            value: enterprise.id
          }))}
          labelField="label"
          valueField="value"
          placeholder="Select enterprise"
          value={enterpriseId}
          onChange={item => setEnterpriseId(item.value)}
        />
      ) : (
        <TextInput style={styles.inputEmail}>
          {enterprises.find(e => e.id === enterpriseId)?.nome || 'No enterprise selected'}
        </TextInput>
      )}

      <View style={styles.actionSave}>
        <Button title="Save" onPress={handleSave} color="white" />
      </View>

      <View style={styles.actionCancel}>
        <Button title="Cancel" onPress={() => navigation.goBack()} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000115',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    color: 'orange',
  },
  input: {
    width: 'auto',
    minWidth: 250,
    height: 40,
    backgroundColor: 'white',
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 30,
    textAlign: 'center',
  },
  inputEmail: {
    width: 250,
    height: 40,
    backgroundColor: 'white',
    opacity: 0.6,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 30,
    textAlign: 'center'
  },
  roleText: {
    color: 'white',
    paddingVertical: 12,
    fontSize: 18,
  },
  dropdown: {
    height: 50,
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    marginBottom: 20
  },
  actionSave: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'orange',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  actionCancel: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000115',
    paddingTop: 20,
  },
});
