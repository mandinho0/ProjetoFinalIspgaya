import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore'; 
import { FIREBASE_AUTH } from '../../../firebase';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importa o ícone Ionicons

const CreateEnterprise = () => {
  const [enterpriseName, setEnterpriseName] = useState('');
  const [loading, setLoading] = useState(false);
  const firestore = getFirestore();
  const navigation = useNavigation();

  const createEnterprise = async () => {
    if (!enterpriseName.trim()) {
      Alert.alert('Error', 'Please enter a valid enterprise name.');
      return;
    }
  
    setLoading(true);
    try {
      // Verifica se já existe uma empresa com o mesmo nome
      const enterpriseQuery = query(
        collection(firestore, 'enterprises'),
        where('nome', '==', enterpriseName.trim())
      );
      
      const querySnapshot = await getDocs(enterpriseQuery);
  
      if (!querySnapshot.empty) {
        Alert.alert('Error', 'An enterprise with this name already exists.');
        setLoading(false);
        return;
      }
  
      // Se não houver duplicatas, crie a nova empresa
      await addDoc(collection(firestore, 'enterprises'), {
        nome: enterpriseName.trim(),
      });
  
      Alert.alert('Success', 'Enterprise created successfully!');
      setEnterpriseName('');
      navigation.goBack(); // Navega de volta para a página anterior
    } catch (error) {
      console.error('Error creating enterprise: ', error);
      Alert.alert('Error', 'An error occurred while creating the enterprise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho personalizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" style={styles.arrowBack} size={40} />
        </TouchableOpacity>
      </View>

      {/* Conteúdo da página */}
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Create Enterprise</Text>
        <Text style={styles.label}>Enterprise Name</Text>
        <TextInput
          value={enterpriseName}
          onChangeText={setEnterpriseName}
          style={styles.input}
          placeholder="Enter enterprise name"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={createEnterprise} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Enterprise'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateEnterprise;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000115',
  },
  // Estilos para o cabeçalho
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40, // Adiciona espaçamento para a status bar
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#000115',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center'
  },
  arrowBack: {
    color: '#fff'
  },
  // Estilos para o conteúdo
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    marginBottom: 100,
  },
  label: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 18,
    alignSelf: 'center'
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e66701',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 12,
    width: 250,
    alignSelf: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
