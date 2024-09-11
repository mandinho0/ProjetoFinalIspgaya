import { FIREBASE_DB } from './firebase';
import { writeBatch, collection, doc } from 'firebase/firestore';
import dimensionsData from './dimensions_questions.json'; // Path to your JSON file

interface DimensionsData {
  [dimension: string]: {
    [subDimension: string]: string[];
  };
}

const insertDataToFirestore = async () => {
  const batch = writeBatch(FIREBASE_DB); // Cria um batch para operações em lote
  const dimensions: DimensionsData = dimensionsData;

  try {
    for (const [dimension, subDimensions] of Object.entries(dimensions)) {
      const dimensionRef = doc(collection(FIREBASE_DB, 'dimensions'), dimension);

      const subDimensionsArray = Object.entries(subDimensions).map(([subDimension, questions]) => ({
        name: subDimension,
        questions: questions,
      }));

      batch.set(dimensionRef, { name: dimension, subDimensions: subDimensionsArray });
    }

    await batch.commit();
    console.log('Data inserted successfully using batch writes');
  } catch (error) {
    console.error('Error inserting data: ', error);
  }

};

export { insertDataToFirestore };
