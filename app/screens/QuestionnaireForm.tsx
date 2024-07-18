import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Pressable, Alert } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebase';
import { Responses, RadioChangeHandler } from '../../types';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useAuth } from '../context/AuthContext';

const options = ['SA', 'MA', 'A', 'NAD', 'D', 'MD', 'SD'];
const optionLabels = [
  'Strongly Agree (SA)', 'Moderately Agree (MA)', 'Agree (A)',
  'Neither Agree nor Disagree (NAD)', 'Disagree (D)',
  'Moderately Disagree (MD)', 'Strongly Disagree (SD)'
];

const QuestionnaireForm: React.FC = () => {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [responses, setResponses] = useState<Responses>({});
  const [questions, setQuestions] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(true);
  const [totalDimensions, setTotalDimensions] = useState<number>(0);
  const [orderedDimensions, setOrderedDimensions] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [innovationArea, setInnovationArea] = useState<string>('');
  const [introCompleted, setIntroCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchTotalDimensions();
  }, []);

  useEffect(() => {
    if (orderedDimensions.length > 0) {
      fetchQuestions(currentScreen);
    }
  }, [currentScreen, orderedDimensions]);

  const fetchTotalDimensions = async () => {
    setLoading(true);
    try {
      const dimensionsSnapshot = await getDocs(collection(FIREBASE_DB, 'dimensions'));
      const dimensions = dimensionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const ordered = dimensions.sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10);
        const numB = parseInt(b.id.replace(/\D/g, ''), 10);
        return numA - numB;
      });

      setOrderedDimensions(ordered);
      setTotalDimensions(ordered.length);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching dimensions count: ", e);
      setLoading(false);
    }
  };

  const fetchQuestions = async (screenIndex: number) => {
    setQuestionsLoading(true);
    try {
      const dimensionDoc = orderedDimensions[screenIndex];
      if (dimensionDoc) {
        const subDimensionsSnapshot = await getDocs(collection(FIREBASE_DB, `dimensions/${dimensionDoc.id}/subDimensions`));
        const fetchedQuestions: any = {};
        fetchedQuestions[dimensionDoc.id] = {};
        for (const subDimensionDoc of subDimensionsSnapshot.docs) {
          const questionsSnapshot = await getDocs(collection(FIREBASE_DB, `dimensions/${dimensionDoc.id}/subDimensions/${subDimensionDoc.id}/questions`));
          fetchedQuestions[dimensionDoc.id][subDimensionDoc.id] = [];
          for (const questionDoc of questionsSnapshot.docs) {
            fetchedQuestions[dimensionDoc.id][subDimensionDoc.id].push(questionDoc.data().question);
          }
        }
        setQuestions((prevQuestions: any) => ({
          ...prevQuestions,
          ...fetchedQuestions
        }));
      }
    } catch (e) {
      console.error("Error fetching questions: ", e);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleRadioChange: RadioChangeHandler = (dimension, subDimension, value) => {
    setResponses((prevState) => ({
      ...prevState,
      [dimension]: {
        ...prevState[dimension],
        [subDimension]: value,
      },
    }));
  };

  const handleIntroSubmit = () => {
    setIntroCompleted(true);
  };

  const validateResponses = () => {
    const dimension = orderedDimensions[currentScreen]?.id;
    if (!dimension) return false;

    const subDimensions = questions[dimension];
    if (!subDimensions) return false;

    for (const subDimension in subDimensions) {
      if (!responses[dimension] || !responses[dimension][subDimension]) {
        return false;
      }
    }
    return true;
  };

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
      <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleIntroSubmit} disabled={!projectName || !innovationArea}>
        <Text style={styles.buttonText}>Start Questionnaire</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScreen = (dimension: string, subDimensions: any) => (
    <View key={dimension}>
      <Text style={styles.dimensionTitle}>{dimension.replaceAll('%20', ' ')}</Text>
      
      <View style={styles.optionMapping}>
        <Text style={styles.optionMappingTitle}>Options Info:</Text>
        <Text style={styles.optionLabel}>A: Agree</Text>
        <Text style={styles.optionLabel}>D: Disagree</Text>
        <Text style={styles.optionLabel}>S: Strongly</Text>
        <Text style={styles.optionLabel}>M: Moderately</Text>
        <Text style={styles.optionLabel}>NAD: Neither Agree or Disagree</Text>
      </View>
      
      {Object.entries(subDimensions).map(([subDimension, questions]: [string, any]) => (
        <View key={subDimension} style={styles.subDimension}>
          <Text style={styles.subDimensionTitle}>{subDimension.replaceAll('%20', ' ').replaceAll('%2', ' ')}</Text>
          {questions.map((question: string, index: number) => (
            <View key={index} style={styles.question}>
              <Text style={styles.questionText}>{question}</Text>
              <View style={styles.radioContainer}>
                {options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.radioOption,
                      responses[dimension]?.[subDimension] === option && styles.radioOptionSelected
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
    </View>
  );

  const screens = Object.entries(questions).map(([dimension, subDimensions]) => renderScreen(dimension, subDimensions));

  const nextScreen = () => {
    if (validateResponses()) {
      setError(null);
      if (currentScreen < totalDimensions - 1) {
        setCurrentScreen(currentScreen + 1);
      }
    } else {
      setError('Please answer all questions before proceeding.');
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const submitQuestionnaire = async () => {
    if (validateResponses()) {
      setError(null);
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        const questionnaireData = {
          questionnaire_id: "unique_id_" + Date.now(),
          userId: user.uid,
          projectName,
          innovationArea,
          responses
        };
        const docRef = await addDoc(collection(FIREBASE_DB, "questionnaires"), questionnaireData);
        console.log("Questionnaire submitted to project: ", questionnaireData.projectName);
        navigation.navigate('ViewEvaluations', { projectName: questionnaireData.projectName });
      } catch (e) {
        console.error("Error submitting questionnaire: ", e);
      }
    } else {
      setError('Please answer all questions before submitting.');
    }
  };

  if (loading || questionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

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
          <Text style={styles.headerText}>Questionnaire Form</Text>
          <View style={styles.formContainer}>
            {screens[currentScreen]}
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={prevScreen}
                disabled={currentScreen === 0}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
              {currentScreen === totalDimensions - 1 ? (
                <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={submitQuestionnaire}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={nextScreen}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
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
    fontSize: 28,
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
  formContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dimensionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: 'orange'
  },
  subDimension: {
    marginBottom: 20,
  },
  subDimensionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  question: {
    backgroundColor: '#1c1c2e',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  questionText: {
    color: '#FFFFFF',
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  radioOption: {
    padding: 5,
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 20,
    width: '100%',
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
  buttonSecondary: {
    backgroundColor: '#6c757d',
  },
  buttonSubmit: {
    backgroundColor: 'green'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionMapping: {
    marginBottom: 25,
    borderColor: 'orange',
    borderWidth: 1,
    borderRadius: 32,
    padding: 16,
    textAlign: 'center'
  },
  optionMappingTitle: {
    fontSize: 14,
    color: 'orange',
    marginBottom: 10,
    textAlign: 'center'
  },
  optionLabel: {
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center'
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  }
});

export default QuestionnaireForm;
