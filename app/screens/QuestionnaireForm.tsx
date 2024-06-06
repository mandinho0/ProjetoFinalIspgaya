import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { collection, addDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase';

type Responses = {
  [key: string]: {
    [key: string]: string | null;
  };
};

const options = [
  { value: '7', label: 'strongly agree' },
  { value: '6', label: 'moderately agree' },
  { value: '5', label: 'agree' },
  { value: '4', label: 'neither agree nor disagree' },
  { value: '3', label: 'disagree' },
  { value: '2', label: 'moderately disagree' },
  { value: '1', label: 'strongly disagree' }
];

const QuestionnaireForm: React.FC = () => {
  const [responses, setResponses] = useState<Responses>({
    D1_Anticipation: {
      Foresight: null,
      Result_Responsible_Usage: null,
      Pro_active_impact_assessment: null
    },
    D2_Reflection: {
      Future_Scenario: null,
      Social_Science_Creativity: null,
      Risk_management: null,
      Risk_report: null,
      Conflict_management: null
    },
    D3_Inclusion: {
      User_center_design: null,
      Participative_research_methods: null,
      Representatives_of_4_helix: null,
      Gender_equality: null,
      Equality_Diversity_Inclusion_Policy: null,
      Exchanging_views: null
    },
    D4_Responsiveness: {
      Contingency_plans: null,
      Real_needs_research_questions: null,
      Innovation_process_adaptation: null,
      SDG_alignment: null
    },
    D5_Transparency: {
      Transparency_open_access: null,
      Data_management_plan: null,
      Visibility: null
    },
    D6_Governance: {
      External_concerns: null,
      Emerging_perspectives: null,
      Public_understanding_scientific_progress: null,
      Crowdsourcing_open_innovation: null,
      Ongoing_monitoring: null
    },
    D7_Legal: {
      Regulatory_compliance: null,
      GDPR_compliance: null
    },
    D8_Ethical: {
      External_ethics_expert: null,
      Codes_of_conduct: null,
      Ethical_issues_human_participation: null,
      Ethical_issues_personal_data: null,
      Disclosure_conflicts_of_interest: null,
      Disclosure_funding_sources: null
    },
    D9_Environmental: {
      Environmental_impacts: null,
      Impact_natural_capital: null,
      Alleviate_environmental_issues: null,
      Circular_use_of_resources: null
    },
    D10_Social: {
      Human_animal_health_impacts: null,
      Equal_access_disabled_people: null,
      Addresses_vulnerable_people: null,
      Addresses_social_needs: null,
      Societal_trends_challenges: null
    },
    D11_Economic: {
      Local_economic_development: null,
      Improves_competitiveness: null,
      Frugality_management: null,
      Contributes_GDP: null
    },
    D12_Technological: {
      Development_technological_products: null,
      Potential_misuse_prevention: null,
      Digital_transformation: null
    },
    D13_Organizational: {
      Diverse_working_approaches: null,
      Responsible_innovation_management: null,
      Corporate_social_responsibility: null,
      Responsible_business_models: null,
      Organizational_learning_capabilities: null,
      Cross_functional_teams: null
    },
    D14_Educational: {
      Contributes_science_education: null,
      Contributes_science_literacy: null,
      RRI_workshops_training: null
    },
    D15_Industrial: {
      Products_life_cycle_improvements: null,
      Targets_circularity: null,
      Knowledge_transfer: null
    },
    D16_Entrepreneurial: {
      Sustainable_value_proposition: null,
      Entrepreneurial_behavior: null,
      Innovation_value_proposition: null,
      Idea_management_platform: null
    }
  });

  const handleRadioChange = (dimension: string, subDimension: string, value: string) => {
    setResponses(prevState => ({
      ...prevState,
      [dimension]: {
        ...prevState[dimension],
        [subDimension]: value
      }
    }));
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

  return (
    <ScrollView>
      <View>
        <Text>Foresight</Text>
        {options.map(option => (
          <View key={option.value} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton
              value={option.value}
              status={responses.D1_Anticipation.Foresight === option.value ? 'checked' : 'unchecked'}
              onPress={() => handleRadioChange('D1_Anticipation', 'Foresight', option.value)}
            />
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>
      <View>
        <Text>Result Responsible Usage</Text>
        {options.map(option => (
          <View key={option.value} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton
              value={option.value}
              status={responses.D1_Anticipation.Result_Responsible_Usage === option.value ? 'checked' : 'unchecked'}
              onPress={() => handleRadioChange('D1_Anticipation', 'Result_Responsible_Usage', option.value)}
            />
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>
      <View>
        <Text>Pro-active impact assessment</Text>
        {options.map(option => (
          <View key={option.value} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton
              value={option.value}
              status={responses.D1_Anticipation.Pro_active_impact_assessment === option.value ? 'checked' : 'unchecked'}
              onPress={() => handleRadioChange('D1_Anticipation', 'Pro_active_impact_assessment', option.value)}
            />
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>
      {/* Continue adicionando outros campos de forma similar para cada sub-dimensão */}
      <Button title="Submit" onPress={submitQuestionnaire} />
    </ScrollView>
  );
};

export default QuestionnaireForm;
