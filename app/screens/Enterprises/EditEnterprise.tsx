import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'; 
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importa o ícone Ionicons

interface RouteParams {
  enterpriseId: string;
}

const EditEnterprise = () => {
  const [enterpriseName, setEnterpriseName] = useState('');
  const [loading, setLoading] = useState(false);
  const firestore = getFirestore();
  const navigation = useNavigation();
  const route = useRoute();
  const { enterpriseId } = route.params as RouteParams;

  useEffect(() => {
    const fetchEnterprise = async () => {
      setLoading(true);
      try {
        const enterpriseDoc = await getDoc(doc(firestore, 'enterprises', enterpriseId));
        if (enterpriseDoc.exists()) {
          setEnterpriseName(enterpriseDoc.data()?.nome || '');
        } else {
          Alert.alert('Error', 'Enterprise not found.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching enterprise: ', error);
        Alert.alert('Error', 'An error occurred while fetching the enterprise.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnterprise();
  }, [enterpriseId]);

  const updateEnterprise = async () => {
    if (!enterpriseName.trim()) {
      Alert.alert('Error', 'Please enter a valid enterprise name.');
      return;
    }

    setLoading(true);

    try {
      // Verificar se o nome da empresa já existe, exceto a própria empresa sendo editada
      const enterpriseQuery = query(
        collection(firestore, 'enterprises'),
        where('nome', '==', enterpriseName.trim())
      );
      const querySnapshot = await getDocs(enterpriseQuery);

      if (!querySnapshot.empty) {
        const existingEnterprise = querySnapshot.docs[0];
        
        // Verifica se a empresa encontrada é diferente da empresa sendo editada
        if (existingEnterprise.id !== enterpriseId) {
          Alert.alert('Error', 'An enterprise with this name already exists.');
          setLoading(false);
          return;
        }
      }

      // Atualiza o nome da empresa no Firestore
      await updateDoc(doc(firestore, 'enterprises', enterpriseId), {
        nome: enterpriseName.trim(),
      });

      Alert.alert('Success', 'Enterprise updated successfully!');
      navigation.goBack(); // Navega de volta para a página anterior
    } catch (error) {
      console.error('Error updating enterprise: ', error);
      Alert.alert('Error', 'An error occurred while updating the enterprise.');
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
        <Text style={styles.headerTitle}>Edit Enterprise</Text>
        <Text style={styles.label}>Enterprise Name</Text>
        <TextInput
          value={enterpriseName}
          onChangeText={setEnterpriseName}
          style={styles.input}
          placeholder="Enter enterprise name"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={updateEnterprise} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Enterprise'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditEnterprise;

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
    textAlign: 'center',
  },
  arrowBack: {
    color: '#fff',
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
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
