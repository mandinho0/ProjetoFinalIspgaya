import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../firebase';
import { RootStackParamList } from '../../../types';
import { useAuth } from '../../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

type EditEvaluationRouteProp = RouteProp<RootStackParamList, 'EditEvaluation'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'EditEvaluation'>;
type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  enterpriseId: string;
};

const EditEvaluation: React.FC = () => {
  const route = useRoute<EditEvaluationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { evaluationId } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [innovationArea, setInnovationArea] = useState<string>('');
  const [responses, setResponses] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
          } as unknown as User))
          .filter(user => user.role === 'user');

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

  useEffect(() => {
    if (evaluationId && user) {
      fetchEvaluationDetails(evaluationId);
    }
  }, [evaluationId, user]);

  const fetchEvaluationDetails = async (evaluationId: string) => {
    setLoading(true);
    try {
      const docRef = doc(FIREBASE_DB, 'questionnaires', evaluationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEvaluation(data);
        setProjectName(data.projectName);
        setInnovationArea(data.innovationArea);
        setSelectedUserId(data.userId);
  
        if (user!.role === 'user' && (!data.responses || Object.keys(data.responses).length === 0)) {
          const initialResponses = await fetchQuestionsFromDimensions();
          setResponses(initialResponses);
        } else {
          setResponses(data.responses);          
        }
      } else {
        Alert.alert("Evaluation not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching evaluation details: ", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchQuestionsFromDimensions = async () => {
    try {
      const dimensionsSnapshot = await getDocs(collection(FIREBASE_DB, 'dimensions'));
      const dimensions: any = {};

      for (const dimensionDoc of dimensionsSnapshot.docs) {
        const dimensionData = dimensionDoc.data();
        const dimensionId = dimensionDoc.id;

        if (!dimensionData.subDimensions || dimensionData.subDimensions.length === 0) {
          console.log(`No subDimensions found for dimension: ${dimensionId}`); // Log para debug
          continue;
        }

        dimensions[dimensionId] = {};

        dimensionData.subDimensions.forEach((subDimension: any) => {
          const subDimensionName = subDimension.name;
          const questions = subDimension.questions || [];
          dimensions[dimensionId][subDimensionName] = 1;
        });
      }

      return dimensions;
    } catch (error) {
      console.error("Error fetching dimensions: ", error);
      return {};
    }
  };


  const handleSave = async () => {
    if (!projectName || !innovationArea) {
      Alert.alert("Error", "Project Name and Innovation Area are required.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(FIREBASE_DB, 'questionnaires', evaluationId);
      await updateDoc(docRef, {
        projectName,
        innovationArea,
        ...(user?.role === 'manager' ? { userId: selectedUserId } : { responses }),
      });
      Alert.alert("Success", "Evaluation updated successfully.");
      navigation.navigate('ViewEvaluations' as never);
    } catch (error) {
      console.error("Error updating evaluation: ", error);
      Alert.alert("Error", "There was an error updating the evaluation.");
    } finally {
      setLoading(false);
    }
  };

  const numericSort = (a: string, b: string) => {    
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    return numA - numB;
  };
  

  const handleScaleChange = (dimension: string, subDimension: string, value: number) => {
    setResponses((prevState: { [x: string]: any; }) => ({
      ...prevState,
      [dimension]: {
        ...prevState[dimension],
        [subDimension]: value
      }
    }));
  };

  const renderManagerFields = () => (
    <View style={styles.containerManagerFields}>
      <Text style={styles.label}>Project Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Project Name"
        placeholderTextColor="#999"
        value={projectName}
        onChangeText={setProjectName}
      />
      <Text style={styles.label}>Innovation Area:</Text>
      <TextInput
        style={styles.input}
        placeholder="Innovation Area"
        placeholderTextColor="#999"
        value={innovationArea}
        onChangeText={setInnovationArea}
      />
      <Text style={styles.label}>Associated User:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedUserId}
          onValueChange={(itemValue, itemIndex) => setSelectedUserId(itemValue)}
          style={styles.picker}
        >
          {users.map((user) => (
            <Picker.Item key={user.id} label={`${user.firstName} ${user.lastName}`} value={user.id} color='white' />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderUserFields = () => (
    <>
      <View style={styles.containerManagerFields}>
        <Text style={styles.label}>Project Name:</Text>
        <Text style={styles.topText}>{projectName}</Text>

        <Text style={styles.label}>Innovation Area:</Text>
        <Text style={styles.topText}>{innovationArea}</Text>
      </View>

      {Object.keys(responses)
      .sort(numericSort)
      .map(dimension => (
        <View key={dimension} style={styles.dimension}>
          <Text style={styles.dimensionTitle}>{dimension.replace(/%20/g, ' ')}</Text>
          
          {Object.entries(responses[dimension] || {})
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([subDimension, value]) => (
              <View key={subDimension} style={styles.subDimension}>
                <Text style={styles.subDimensionTitle}>{subDimension.replace(/%20/g, ' ').replace(/%2C/g, ', ')}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={7}
                  step={1}
                  value={typeof value === 'number' ? value : 1}
                  onValueChange={(sliderValue) => handleScaleChange(dimension, subDimension, sliderValue)}
                  minimumTrackTintColor="orange"
                  maximumTrackTintColor="#444"
                />
                <Text style={styles.scaleValue}>
                  Value: {typeof value === 'number' ? value : 1}
                </Text>
              </View>
            ))}
        </View>
      ))}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!evaluation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No evaluation details available.</Text>
      </View>
    );
  }

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
        <Pressable>
          {user?.role === 'manager' ? renderManagerFields() : renderUserFields()}

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000115',
    padding: 50,
    paddingHorizontal: 20,
  },
  containerManagerFields: {
    flex: 1,
    backgroundColor: '#000115',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#fff',
    borderRadius: 30,
    marginBottom: 20,
    overflow:'hidden',
    width: 300,
    backgroundColor: '#fff',
    color: 'white',
  },
  picker: {
    backgroundColor: '#333'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    padding: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 30,
    marginBottom: 20,
    color: '#FFFFFF',
    backgroundColor: '#333',
  },
  dimension: {
    marginBottom: 20,
  },
  dimensionTitle: {
    color: 'orange',
    fontSize: 18,
    marginBottom: 10,
  },
  subDimension: {
    marginTop: 20,
    marginBottom: 10,
  },
  subDimensionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  slider: {
    width: 300,
    height: 40,
    marginTop: 8,
  },
  scaleValue: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: 'orange',
    color:'black',
    width: 200,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 100,
    justifyContent: 'center',
    margin: 'auto'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    color: 'orange',
    fontSize: 16,
    marginBottom: 10,
  },
  topText: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },
});

export default EditEvaluation;
