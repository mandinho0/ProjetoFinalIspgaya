import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function MyAccount() {
  const { user, signOut, loading } = useAuth();
  const navigation = useNavigation();

  console.log("User in MyAccount: ", user);

  const handleEdit = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      "SignOut",
      "Are you sure you want to signout now?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "SignOut",
          onPress: () => {
            signOut();
          },
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>No user information available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>
      
      <View style={styles.labelsContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>First Name:</Text>
          <Text style={styles.text}>{user.firstName}</Text>
        </View>
        
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Last Name:</Text>
          <Text style={styles.text}>{user.lastName}</Text>
        </View>
        
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.text}>{user.email}</Text>
        </View>

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.text}>{user.role}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button title="Edit Information" onPress={handleEdit} />
        <Button title="SignOut" onPress={handleLogout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000115',
    padding: 20,
  },
  labelsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 30
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000115',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    color: 'orange',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: 'gray',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000115',
  },
});
