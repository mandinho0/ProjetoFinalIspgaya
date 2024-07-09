import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebase';
import { Responses, RadioChangeHandler } from '../../types';

const options = ['SA', 'MA', 'A', 'NAD', 'D', 'MD', 'SD'];
const optionLabels = [
  'Strongly Agree (SA)', 'Moderately Agree (MA)', 'Agree (A)',
  'Neither Agree nor Disagree (NAD)', 'Disagree (D)',
  'Moderately Disagree (MD)', 'Strongly Disagree (SD)'
];

const QuestionnaireForm: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [responses, setResponses] = useState<Responses>({});
  const [questions, setQuestions] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [totalDimensions, setTotalDimensions] = useState<number>(0);
  const [orderedDimensions, setOrderedDimensions] = useState<any[]>([]);

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

      // Order dimensions numerically by extracting the numeric part
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
    setLoading(true);
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
      setLoading(false);
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

  const renderScreen = (dimension: string, subDimensions: any) => (
    <View key={dimension}>
      <Text style={styles.dimensionTitle}>{dimension.replaceAll('%20', ' ')}</Text>
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
      <View style={styles.optionMapping}>
        {optionLabels.map((label, idx) => (
          <Text key={idx} style={styles.optionLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );

  const screens = Object.entries(questions).map(([dimension, subDimensions]) => renderScreen(dimension, subDimensions));

  const nextScreen = () => {
    if (currentScreen < totalDimensions - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const submitQuestionnaire = async () => {
    try {
      const questionnaireData = {
        questionnaire_id: "unique_id_" + Date.now(),
        responses: responses
      };
      const docRef = await addDoc(collection(FIREBASE_DB, "questionnaires"), questionnaireData);
      console.log("Questionnaire submitted with ID: ", docRef.id);
    } catch (e) {
      console.error("Error submitting questionnaire: ", e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
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
      ><Pressable>
          <Text style={styles.headerText}>Questionnaire Form</Text>
          <View style={styles.formContainer}>
            {screens[currentScreen]}
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
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 48
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
    width: '100%', // Add width to buttons container
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
    marginTop: 20,
  },
  optionLabel: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
});

export default QuestionnaireForm;
