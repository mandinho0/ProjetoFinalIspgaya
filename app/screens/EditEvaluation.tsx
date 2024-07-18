import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebase';
import { RootStackParamList } from '../../types';
import { useAuth } from '../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const options = ['SA', 'MA', 'A', 'NAD', 'D', 'MD', 'SD'];
const optionLabels = [
  'Strongly Agree (SA)', 'Moderately Agree (MA)', 'Agree (A)',
  'Neither Agree nor Disagree (NAD)', 'Disagree (D)',
  'Moderately Disagree (MD)', 'Strongly Disagree (SD)'
];

type EditEvaluationRouteProp = RouteProp<RootStackParamList, 'EditEvaluation'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'EditEvaluation'>;

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
        setResponses(data.responses);
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
        responses
      });
      Alert.alert("Success", "Evaluation updated successfully.");
      navigation.navigate('ViewEvaluationDetail', { evaluationId });
    } catch (error) {
      console.error("Error updating evaluation: ", error);
      Alert.alert("Error", "There was an error updating the evaluation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (dimension: string, subDimension: string, value: string) => {
    setResponses((prevState: { [x: string]: any; }) => ({
      ...prevState,
      [dimension]: {
        ...prevState[dimension],
        [subDimension]: value
      }
    }));
  };

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
            <TextInput
            style={styles.input}
            placeholder="Project Name"
            placeholderTextColor="#999"
            value={projectName}
            onChangeText={setProjectName}
            />
            <TextInput
            style={styles.input}
            placeholder="Innovation Area"
            placeholderTextColor="#999"
            value={innovationArea}
            onChangeText={setInnovationArea}
            />
            <View style={styles.labelContainer}>
            {optionLabels.map((label, index) => (
                <Text key={index} style={styles.labelText}>{label}</Text>
            ))}
            </View>
            {Object.keys(responses).sort((a, b) => parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10)).map(dimension => (
            <View key={dimension} style={styles.dimension}>
                <Text style={styles.dimensionTitle}>{dimension.replace(/%20/g, ' ')}</Text>
                {Object.keys(responses[dimension]).map(subDimension => (
                <View key={subDimension} style={styles.subDimension}>
                    <Text style={styles.subDimensionTitle}>{subDimension.replace(/%20/g, ' ').replace(/%2C/g, ', ')}</Text>
                    <View style={styles.radioContainer}>
                    {options.map(option => (
                        <TouchableOpacity
                        key={option}
                        style={[
                            styles.radioOption,
                            responses[dimension][subDimension] === option && styles.radioOptionSelected
                        ]}
                        onPress={() => handleRadioChange(dimension, subDimension, option)}
                        >
                        <Text style={styles.radioLabel}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    </View>
                </View>
                ))}
            </View>
            ))}
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
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000115',
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
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    marginBottom: 20,
    color: '#FFFFFF',
    backgroundColor: '#333',
  },
  labelContainer: {
    marginBottom: 20,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 14,
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
    marginBottom: 10,
  },
  subDimensionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioOption: {
    padding: 10,
    margin: 5,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  radioOptionSelected: {
    backgroundColor: 'orange',
  },
  radioLabel: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditEvaluation;
