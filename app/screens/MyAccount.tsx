import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../../navigationTypes';
import { Enterprise } from '../../types';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

export default function MyAccount() {
  const { user, signOut, loading } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const firestore = getFirestore();  
  
  const handleEdit = () => {
    navigation.navigate('EditUser', { userId: user!.uid }); 
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout now?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            signOut();
            navigation.navigate('Login'); 
          },
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>No user information available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>
      
      <View style={styles.labelsContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.text}>{user.firstName + ' ' + user.lastName}</Text>
        </View>
        
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.text}>{user.email}</Text>
        </View>

      <View style={styles.labelContainer}>
        <Text style={styles.label}>Enterprise:</Text>
        <Text style={styles.text}>{enterprises.find(e => e.id === user.enterpriseId)?.nome || 'No enterprise selected'}</Text>
      </View>

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.text}>{user.role}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button title="Edit Information" onPress={handleEdit}/>
        <Button title="Logout" onPress={handleLogout} color="red"/>
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
  labelsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 30
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000115',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    color: 'orange',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: 'gray',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000115',
    textTransform: 'capitalize'
  },
});
