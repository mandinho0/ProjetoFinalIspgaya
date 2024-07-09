import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { insertDataToFirestore } from '../../insertDefaultQuestions';

const SummaryScreen: React.FC = () => {
  const navigation = useNavigation();

  const navigateToViewEvaluations = () => {
    navigation.navigate('ViewEvaluations' as never); // Defina este nome com base no seu roteamento
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary Screen</Text>
      <Text style={styles.info}>
        Your avaliation was successfully submitted
      </Text>
      <Button
        title="Ver Avaliações"
        onPress={navigateToViewEvaluations}
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

export default SummaryScreen;
