import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../firebase';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../../navigationTypes';

type ViewEnterprisesScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'ViewEnterprises'
>;

const ViewEnterprises: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [enterprises, setEnterprises] = useState<any[]>([]);

  const navigation = useNavigation<ViewEnterprisesScreenNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      fetchEnterprises();
    }, [])
  );

  const fetchEnterprises = async () => {
    try {
      const querySnapshot = await getDocs(collection(FIREBASE_DB, 'enterprises'));
      const enterprisesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEnterprises(enterprisesList);
    } catch (error) {
      console.error("Error fetching enterprises: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnterprise = async (id: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'enterprises', id));
      Alert.alert('Success', 'Enterprise deleted successfully.');
      fetchEnterprises();
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the enterprise.');
    }
  };

  const confirmDeleteEnterprise = (id: string) => {
    Alert.alert(
      'Delete Enterprise',
      'Are you sure you want to delete this enterprise?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDeleteEnterprise(id), style: 'destructive' }
      ]
    );
  };

  const renderEnterprise = ({ item }: { item: any }) => (
    <View style={styles.enterpriseContainer}>
      <Text style={styles.enterpriseText}>{item.nome}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditEnterprise', { enterpriseId: item.id })}
        >
          <Icon name="pencil" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteEnterprise(item.id)}
        >
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const navigateToCreateEnterprise = () => {
    navigation.navigate('CreateEnterprise');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enterprises</Text>
      <TouchableOpacity onPress={navigateToCreateEnterprise} style={styles.buttonAdd}>
        <Text style={styles.buttonText}>
          Add new
          <Icon name="plus" size={16} color="gray" />
        </Text>
      </TouchableOpacity>
      {enterprises.length > 0 ? (
        <FlatList
          data={enterprises}
          renderItem={renderEnterprise}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noEnterprisesText}>No enterprises found.</Text>
      )}
    </View>
  );
};

export default ViewEnterprises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000115',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    marginVertical: 30,
    textAlign: 'center',
  },
  buttonAdd: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    marginRight: 8,
  },
  enterpriseContainer: {
    backgroundColor: '#1e1e2d',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enterpriseText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  noEnterprisesText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {},
});
