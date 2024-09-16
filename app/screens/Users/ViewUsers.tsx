import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../firebase';
import { getAuth } from 'firebase/auth';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../../navigationTypes';

type ViewUsersScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'ViewUsers'
>;

const ViewUsers: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<any[]>([]);
  const navigation = useNavigation<ViewUsersScreenNavigationProp>();

  const currentUserUid = getAuth().currentUser?.uid;

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(FIREBASE_DB, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(), 
      }));
      
      const filteredUsers = usersList.filter(user => user.id !== currentUserUid);

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'users', id));
      Alert.alert('Success', 'User deleted successfully.');
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the user.');
    }
  };

  const confirmDeleteUser = (id: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDeleteUser(id), style: 'destructive' }
      ]
    );
  };

  const renderUser = ({ item }: { item: any }) =>(
    <View style={styles.userContainer}>
      <Text style={styles.userText}>{item.firstName + ' ' + item.lastName}</Text>
      <Text style={styles.userText}>{item.role}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditUser', { userId: item.id })}
        >
          <Icon name="pencil" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteUser(item.id)}
        >
          <Icon name="delete" size={24} color="orange" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const navigateToCreateUser = () => {
    navigation.navigate('CreateUser' as never);
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
      <Text style={styles.title}>Users</Text>
      

      {users.length > 0 && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTextName}>Name</Text>
          <Text style={styles.headerTextRole}>Role</Text>
          <Text style={styles.headerTextActions}>Actions</Text>
        </View>
      )}

      {users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noUsersText}>No users found.</Text>
      )}
    </View>
  );
};

export default ViewUsers;

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
  userContainer: {
    backgroundColor: '#1e1e2d',
    padding: 15,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 18,
    width: '33%', 
    textAlign: 'left',
  },
  noUsersText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 20,
  },
  deleteButton: {},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
  },
  headerTextName: {
    color: '#FFFFFF',
    fontSize: 18,
    width: '33%',
    textAlign: 'left',
  },
  headerTextRole: {
    color: '#FFFFFF',
    fontSize: 18,
    width: '33%',
    textAlign: 'center',
    paddingRight: 30
  },
  headerTextActions: {
    color: 'orange',
    fontSize: 14,
    width: '33%',
    textAlign: 'right',
    paddingTop: 4,
    paddingRight: 8
  },
});
