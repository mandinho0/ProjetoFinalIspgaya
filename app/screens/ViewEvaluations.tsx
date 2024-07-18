import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { Menu, Provider } from 'react-native-paper';
import { FIREBASE_DB } from '../../firebase';
import { RootStackParamList } from '../../types';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';

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

  useEffect(() => {
    if (user) {
      fetchUserEvaluations(user.uid);
    }
  }, [user]);

  const fetchUserEvaluations = async (userId: string) => {
    try {
      const q = query(collection(FIREBASE_DB, 'questionnaires'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userEvaluations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvaluations(userEvaluations);
    } catch (error) {
      console.error("Error fetching user evaluations: ", error);
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
              <Text style={styles.title}>Your Evaluations</Text>
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
                      <Menu.Item onPress={() => handleDelete(evaluation.id)} title="Delete" />
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
    alignItems: 'center',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evaluationContainer: {
    width: '100%',
    backgroundColor: '#1e1e2d',
    padding: 15,
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
