import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Responses, RadioChangeHandler } from '../../types';

// Definir os tipos para as chaves de D1_Anticipation
type D1_AnticipationKeys = 'Foresight' | 'Result_Responsible_Usage' | 'Pro_active_impact_assessment';

const options: { value: D1_AnticipationKeys, label: string }[] = [
  { value: 'Foresight', label: 'Foresight - Anticipation of future outcomes' },
  { value: 'Result_Responsible_Usage', label: 'Result Responsible Usage - Responsible handling of outcomes' },
  { value: 'Pro_active_impact_assessment', label: 'Pro-active impact assessment - Assessing impacts beforehand' },
];

interface D1_AnticipationProps {
  responses: Responses;
  handleRadioChange: RadioChangeHandler;
}

const D1_Anticipation: React.FC<D1_AnticipationProps> = ({ responses, handleRadioChange }) => (
  <View style={{ flex: 1 }}>
    <View style={styles.header}>
      <Text style={styles.subheader}>D1 - Anticipation</Text>
    </View>
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {options.map(option => (
          <View key={option.value} style={styles.categoryContainer}>
            <Text style={styles.categoryHeading}>{option.label}</Text>
            <View style={styles.optionsContainer}>
              {['1', '2', '3', '4', '5', '6', '7'].map(value => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.optionContainer,
                    responses.D1_Anticipation[option.value] === value && styles.selectedOptionContainer
                  ]}
                  onPress={() => handleRadioChange('D1_Anticipation', option.value, value)}
                >
                  <RadioButton
                    value={value}
                    status={responses.D1_Anticipation[option.value] === value ? 'checked' : 'unchecked'}
                    onPress={() => handleRadioChange('D1_Anticipation', option.value, value)}
                  />
                  <Text style={styles.optionText}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000115',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 50,
    marginVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 16
  },
  subheader: {
    fontSize: 20,
    color: 'orange'
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  innerContainer: {
    paddingTop: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF'
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    padding: 5,
    backgroundColor: 'white',
    textAlign:'center'
  },
  selectedOptionContainer: {
    backgroundColor: 'green',
    padding: 8,
    borderRadius: 5, // Add border radius to match the radio button style
  },
  optionText: {
    marginLeft: 10,
    color: 'orange',
  }
});

export default D1_Anticipation;
