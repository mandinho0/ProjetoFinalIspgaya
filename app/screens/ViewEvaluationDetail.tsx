import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebase';
import { RootStackParamList } from '../../types';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as XLSX from 'xlsx';

const options = ['SA', 'MA', 'A', 'NAD', 'D', 'MD', 'SD'];
const optionLabels = [
  'Strongly Agree ', 'Moderately Agree', 'Agree',
  'Neither Agree nor Disagree', 'Disagree',
  'Moderately Disagree', 'Strongly Disagree'
];

type ViewEvaluationDetailRouteProp = RouteProp<RootStackParamList, 'ViewEvaluationDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'ViewEvaluationDetail'>;

const ViewEvaluationDetail: React.FC = () => {
  const route = useRoute<ViewEvaluationDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { evaluationId } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    if (evaluationId && user) {
      fetchEvaluationDetails(evaluationId);
    }
  }, [evaluationId, user]);

  const fetchEvaluationDetails = async (evaluationId: string) => {
    setLoading(true);
    try {
      const docRef = doc(FIREBASE_DB, 'questionnaires', evaluationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvaluation(docSnap.data());
      } else {
        Alert.alert("Evaluation not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching evaluation details: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditEvaluation', { evaluationId });
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Evaluation",
      "Are you sure you want to delete this evaluation?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(FIREBASE_DB, 'questionnaires', evaluationId));
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting evaluation: ", error);
            }
          }
        }
      ]
    );
  };

  const createPDF = async () => {
    if (!evaluation) return;

    const htmlContent = `
      <html>
        <body>
          <h1>Evaluation Details</h1>
          <h2>Project Name: ${evaluation.projectName}</h2>
          <h3>Innovation Area: ${evaluation.innovationArea}</h3>
          <h4>Responses:</h4>
          ${Object.keys(evaluation.responses).sort(numericSort).map(dimension => `
            <div>
              <h5>${dimension.replace(/%20/g, ' ')}</h5>
              ${Object.keys(evaluation.responses[dimension]).map(subDimension => `
                <p>${subDimension.replace(/%20/g, ' ').replace(/%2C/g, ', ').replace(/%2/g, ', ')}: ${evaluation.responses[dimension][subDimension]}</p>
              `).join('')}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  };

  const createExcel = async () => {
    if (!evaluation) return;

    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Dimension", "Sub Dimension", "Response"]
    ];

    Object.keys(evaluation.responses).sort(numericSort).forEach(dimension => {
      Object.keys(evaluation.responses[dimension]).forEach(subDimension => {
        wsData.push([
          dimension.replace(/%20/g, ' '),
          subDimension.replace(/%20/g, ' ').replace(/%2C/g, ', '),
          evaluation.responses[dimension][subDimension]
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Evaluation");
    const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });

    const uri = `${FileSystem.documentDirectory}evaluation.xlsx`;
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64
    });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Evaluation Data',
      UTI: 'com.microsoft.excel.xlsx'
    });
  };

  const numericSort = (a: string, b: string) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    return numA - numB;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!evaluation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No evaluation details available.</Text>
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
          <View style={styles.header}>
            <Text style={styles.titleName}>{evaluation.projectName}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                <Icon name="pencil" size={24} color="#333300" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                <Icon name="delete" size={24} color="#333300" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innovationArea}>
            <Text style={styles.subtitle}>
              <Text style={styles.innovationAreaLabel}>
                Innovation Area - 
              </Text>
              <Text>
               {' ' + evaluation.innovationArea}
              </Text>
            </Text>
          </View>

          <View style={styles.labelContainer}>
            <Text style={styles.optionsLabel}>Options Info:</Text>
            {optionLabels.map((label, index) => (
            <Text key={index} style={styles.labelText}>
              <Text style={{ fontWeight: 'bold' }}>{options[index] + ': '}</Text>
              {label}
            </Text>
            ))}
          </View>

          {Object.keys(evaluation.responses).sort(numericSort).map(dimension => (
            <View key={dimension} style={styles.dimension}>
              <Text style={styles.dimensionTitle}>{dimension.replace(/%20/g, ' ')}</Text>
              {Object.keys(evaluation.responses[dimension]).map(subDimension => (
                <Text key={subDimension} style={styles.response}>
                  {subDimension.replace(/%20/g, ' ').replace(/%2C/g, ', ').replace(/%2/g, ', ')}: {evaluation.responses[dimension][subDimension]}
                </Text>
              ))}
            </View>
          ))}
          <View style={styles.downloadButtons}>
            <TouchableOpacity style={styles.button} onPress={createPDF}>
              <Text style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Download PDF</Text>
                <Icon name="download" size={20} color="#FFFFFF" style={styles.iconsDownload} />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={createExcel}>
              <Text style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Download Excel</Text>
                <Icon name="download" size={20} color="#FFFFFF" style={styles.iconsDownload} />
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000115',
    paddingVertical: 60,
  },
  innovationArea: {
    borderColor: 'orange',
    borderWidth: 1,
    marginBottom: 28,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    verticalAlign: 'middle',
    paddingTop: 16
  },
  innovationAreaLabel: {
    fontWeight: '500',
    marginRight: 32,
    justifyContent: 'space-evenly'
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
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    backgroundColor: 'gray',
    borderRadius: 32,
    paddingHorizontal: 12
  },
  headerActions: {
    display:'flex',
    flexDirection: 'row',
  },
  iconButton: {
    paddingHorizontal: 10,
    verticalAlign: 'middle',
    alignSelf: 'center'
  },
  labelContainer: {
    marginBottom: 20,
    backgroundColor: 'orange',
    padding: 16,
    borderRadius: 32,
    textAlign: 'center',
    margin: 'auto'
  },
  labelText: {
    color: 'black',
    fontSize: 12,
    paddingVertical: 2,
    fontWeight: '500'
  },
  optionsLabel: {
    color: 'black',
    fontSize: 16,
    marginBottom: 10,
    borderRadius: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  titleName: {
    color: 'orange',
    fontSize: 20,
    padding: 12,
    fontWeight: '500'
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 10,
  },
  dimension: {
    marginBottom: 20,
  },
  dimensionTitle: {
    color: 'orange',
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center'
  },
  response: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5
  },
  downloadButtons: {
    marginTop: 20,
    alignItems: 'center',
    verticalAlign: 'middle'
  },
  buttonContainer: {
    verticalAlign: 'middle',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column'
  },
  button: {
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    width: '70%',
    verticalAlign: 'middle',
    justifyContent: 'space-between'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    verticalAlign: 'middle',
    paddingRight: 18,
    justifyContent: 'space-between',
    paddingBottom: 8
  },
  iconsDownload: {
    verticalAlign: 'middle',
    justifyContent: 'space-between'
  }
});

export default ViewEvaluationDetail;
