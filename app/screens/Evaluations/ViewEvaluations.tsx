import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { Menu, Provider } from 'react-native-paper';
import { FIREBASE_DB } from '../../../firebase';
import { RootStackParamList } from '../../../types';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

type ViewEvaluationsRouteProp = RouteProp<RootStackParamList, 'ViewEvaluations'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'ViewEvaluations'>;

const ViewEvaluations: React.FC = () => {
  const route = useRoute<ViewEvaluationsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { projectName } = route.params || {};
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const { user } = useAuth();
  const [visible, setVisible] = useState<string | null>(null);

  const navigateToCreateEvaluation = () => {
    navigation.navigate('Form' as never); 
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
      fetchEvaluations();
    }
    }, [user])
  );

  const fetchEvaluations = async () => {
    try {
      let q;
      if (user!.role === 'manager') {
        q = query(
          collection(FIREBASE_DB, 'questionnaires'),
          where('enterpriseId', '==', user!.enterpriseId)
        );
      } else if (user!.role === 'user') {
        q = query(
          collection(FIREBASE_DB, 'questionnaires'),
          where('userId', '==', user!.uid)
        );
      } else {
        q = query(
          collection(FIREBASE_DB, 'questionnaires')
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedEvaluations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvaluations(fetchedEvaluations);
    } catch (error) {
      console.error("Error fetching evaluations: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (evaluationId: string) => {
    navigation.navigate('ViewEvaluationDetail', { evaluationId });
  };

  const handleEdit = (evaluationId: string) => {
    navigation.navigate('EditEvaluation', { evaluationId });
  };

  const handleDelete = async (evaluationId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'questionnaires', evaluationId));
      setEvaluations(prevEvaluations => prevEvaluations.filter(evaluation => evaluation.id !== evaluationId));
    } catch (error) {
      console.error("Error deleting evaluation: ", error);
    }
  };

  const openMenu = (evaluationId: string) => setVisible(evaluationId);
  const closeMenu = () => setVisible(null);

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
      >
        <Pressable>
          <Provider>
            <View style={styles.container}>
              {projectName && (
                <Text style={styles.projectMessage}>Evaluation submitted successfully: {projectName}</Text>
              )}
              <Text style={styles.title}>Evaluations</Text>

              {user?.role === 'manager' && (
                <TouchableOpacity onPress={navigateToCreateEvaluation} style={styles.buttonAdd}>
                  <Text>
                    <Text style={styles.buttonText}>New</Text>
                    <Icon name="plus" size={16} color="gray"/>
                  </Text>
                </TouchableOpacity>
              )}

              {evaluations.length > 0 ? (
                evaluations.map((evaluation) => (
                  <View key={evaluation.id} style={styles.evaluationContainer}>
                    <Text style={styles.evaluationText}>{evaluation.projectName}</Text>
                    
                    <Menu
                      visible={visible === evaluation.id}
                      onDismiss={closeMenu}
                      anchor={
                        <TouchableOpacity onPress={() => openMenu(evaluation.id)} style={styles.menuButton}>
                          <Icon name="dots-vertical" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                      }>
                      <Menu.Item onPress={() => handleView(evaluation.id)} title="View" />
                      <Menu.Item onPress={() => handleEdit(evaluation.id)} title="Edit" />
                      {user!.role === 'manager' || user!.role === 'admin' && (
                        <>
                          <Menu.Item onPress={() => handleDelete(evaluation.id)} title="Delete" />
                        </>
                      )}
                    </Menu>
                  </View>
                ))
              ) : (
                <Text style={styles.noEvaluationsText}>No evaluations found.</Text>
              )}
            </View>
          </Provider>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
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
  projectMessage: {
    color: '#FFFFFF',
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    marginVertical: 30,
    alignSelf: 'center'
  },
  buttonAdd: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    alignContent: 'center',
    textAlignVertical: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 8
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    verticalAlign: 'middle',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evaluationContainer: {
    width: '100%',
    backgroundColor: '#1e1e2d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evaluationText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  menuButton: {
    padding: 10,
  },
  noEvaluationsText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginVertical: 20,
  },
});

export default ViewEvaluations;
