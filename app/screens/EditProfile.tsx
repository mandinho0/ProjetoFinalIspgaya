import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function EditProfile() {
  const { user, updateUser, loading } = useAuth();
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    if (!firstName || !lastName || !email) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      email,
      emailVerified: user?.emailVerified ?? false,
      isAnonymous: user?.isAnonymous ?? false,
      metadata: user?.metadata ?? { creationTime: '', lastSignInTime: '' },
      providerData: user?.providerData ?? [],
      refreshToken: user?.refreshToken ?? '',
      tenantId: user?.tenantId ?? null,
      delete: user?.delete ?? (() => Promise.resolve()),
      getIdToken: user?.getIdToken ?? (() => Promise.resolve('')),
      getIdTokenResult: user?.getIdTokenResult ?? (() => Promise.resolve({} as any)),
      reload: user?.reload ?? (() => Promise.resolve()),
      toJSON: user?.toJSON ?? (() => ({})),
      displayName: user?.displayName ?? null,
      phoneNumber: user?.phoneNumber ?? null,
      photoURL: user?.photoURL ?? null,
      providerId: user?.providerId ?? '',
      uid: user?.uid ?? '',
    };

    updateUser(updatedUser).then(() => {
      Alert.alert("Success", "Information updated successfully.");
      navigation.goBack();
    }).catch((error) => {
      Alert.alert("Error", error.message);
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={{color: 'white', paddingBottom: 12}}>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Text style={{color: 'white', paddingBottom: 12}}>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <Text style={{color: 'white', paddingBottom: 12}}>Email</Text>
      <TextInput
        style={styles.inputEmail}
        placeholder="Email"
        value={email}
        editable={false}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <View style={styles.actions}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Cancel" onPress={() => navigation.goBack()} color="red" />
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
  title: {
    fontSize: 24,
    marginBottom: 40,
    color: 'orange',
  },
  input: {
    width: 'auto',
    minWidth: 250,
    height: 40,
    backgroundColor: 'white',
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 30,
    textAlign:'center'
  },
  inputEmail: {
    width: 'auto',
    height: 40,
    backgroundColor: 'white',
    opacity: 0.6,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000115',
    paddingTop: 20,
  },
});
