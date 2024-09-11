import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation();

  const navigateToEnterprises = () => {
    navigation.navigate('ViewEnterprises' as never); // Página para visualizar e gerenciar Enterprises
  };

  const navigateToEvaluations = () => {
    navigation.navigate('ViewEvaluations' as never); // Página para visualizar e gerenciar Evaluations
  };

  const navigateToUsers = () => {
    navigation.navigate('ViewUsers' as never); // Página para visualizar e gerenciar Users
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <TouchableOpacity style={styles.card} onPress={navigateToEnterprises}>
        <Icon name="domain" size={40} color="#FFF" />
        <Text style={styles.cardText}>Manage Enterprises</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={navigateToEvaluations}>
        <Icon name="file-document" size={40} color="#FFF" />
        <Text style={styles.cardText}>Manage Evaluations</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={navigateToUsers}>
        <Icon name="account-multiple" size={40} color="#FFF" />
        <Text style={styles.cardText}>Manage Users</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000115',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1e1e2d',
    width: '90%',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 15,
  },
});

export default AdminDashboard;
