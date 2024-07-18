import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { insertDataToFirestore } from '../../insertDefaultQuestions';

const Homepage: React.FC = () => {
  const navigation = useNavigation();

  const navigateToViewEvaluations = () => {
    navigation.navigate('ViewEvaluations' as never); 
  };

  const navigateToCreateEvaluation = () => {
    navigation.navigate('QuestionnaireForm' as never); 
  };

  // Insert default data on firestore only once
  //insertDataToFirestore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Sistema de Avaliações</Text>
      <Text style={styles.info}>
        Aqui pode visualizar todas as avaliações ou criar uma nova avaliação.
      </Text>
      <Button
        title="Ver Avaliações"
        onPress={navigateToViewEvaluations}
      />
      <Button
        title="Criar Nova Avaliação"
        onPress={navigateToCreateEvaluation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000115'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white'
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: 'white'
  }
});

export default Homepage;
