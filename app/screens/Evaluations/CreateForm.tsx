import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../firebase';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../../types';
import { Picker } from '@react-native-picker/picker'; 

// Define the type for a User including 'role' and 'enterpriseId'
type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: string; // Ensure 'role' exists on the User type
  enterpriseId: string; // Ensure 'enterpriseId' exists on the User type
};

const Form: React.FC = () => {
  const { user } = useAuth(); // Current logged-in user (manager)
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>('');
  const [innovationArea, setInnovationArea] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [introCompleted, setIntroCompleted] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Effect to load users with role 'user'
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(FIREBASE_DB, 'users'));
        const usersList = usersSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as User)) // Explicitly typing the returned data as User
          .filter(user => user.role === 'user'); // Filter users with role 'user'

        setUsers(usersList);
      } catch (e) {
        console.error("Error fetching users: ", e);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleIntroSubmit = async () => {
    if (!selectedUserId) {
      setError('Please select a user.');
      return;
    }

    if (!projectName || !innovationArea) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);

    try {
      const questionnaireData = {
        managerId: user?.uid,
        userId: selectedUserId,
        projectName,
        innovationArea,
        enterpriseId: user?.enterpriseId, // Associate the enterprise ID of the manager
        createdAt: new Date(),
        status: 'pending'
      };

      await addDoc(collection(FIREBASE_DB, 'questionnaires'), questionnaireData);

      Alert.alert('Success', 'Questionnaire created successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('ViewEvaluations' as never); 
          },
        },
      ]);
    } catch (e) {
      console.error("Error creating questionnaire: ", e);
      setError("Failed to create questionnaire.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const renderIntro = () => (
    <View style={styles.introContainer}>
      <Text style={styles.headerText}>Project Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Project Name"
        placeholderTextColor="#999"
        value={projectName}
        onChangeText={setProjectName}
      />
      <TextInput
        style={styles.input}
        placeholder="Area of Innovation"
        placeholderTextColor="#999"
        value={innovationArea}
        onChangeText={setInnovationArea}
      />

      <Text style={styles.headerText}>User</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedUserId}
          onValueChange={(itemValue, itemIndex) => setSelectedUserId(itemValue)}
          style={styles.picker}
        >
          {users.map((user) => (
            <Picker.Item key={user.id} label={`${user.firstName} ${user.lastName}`} value={user.id} />
          ))}
        </Picker>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleIntroSubmit}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );

  if (!introCompleted) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {renderIntro()}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000115',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    marginBottom: 20,
    width: 300,
    backgroundColor: '#333',
  },
  picker: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 48
  },
  input: {
    width: '100%',
    height: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    marginBottom: 20,
    color: '#FFFFFF',
    backgroundColor: '#333',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userButton: {
    padding: 10,
    backgroundColor: '#444',
    marginVertical: 5,
    borderRadius: 5,
  },
  selectedUserButton: {
    backgroundColor: 'orange',
  },
  userButtonText: {
    color: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default Form;
