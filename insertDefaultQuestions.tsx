// insertDataToFirestore.ts
import { FIREBASE_DB } from './firebase';
import { collection, doc, setDoc, addDoc, getDoc } from 'firebase/firestore';
import dimensionsData from './dimensions_questions.json'; // path to your JSON file

interface DimensionsData {
  [dimension: string]: {
    [subDimension: string]: string[];
  };
}

const insertDataToFirestore = async () => {
  try {
    const dimensions: DimensionsData = dimensionsData;

    for (const [dimension, subDimensions] of Object.entries(dimensions)) {
      // Create a document reference for each dimension
      const dimensionRef = doc(collection(FIREBASE_DB, 'dimensions'), dimension);
      
      // Check if the dimension document already exists
      const dimensionDoc = await getDoc(dimensionRef);
      if (dimensionDoc.exists()) {
        console.log(`Dimension ${dimension} already exists. Skipping insertion.`);
        continue;
      }

      // Set the dimension document
      await setDoc(dimensionRef, { name: dimension });

      for (const [subDimension, questions] of Object.entries(subDimensions)) {
        // Encode subDimension to handle spaces and special characters
        const encodedSubDimension = encodeURIComponent(subDimension);
        
        // Create a collection reference for subDimensions under each dimension
        const subDimensionsCollectionRef = collection(FIREBASE_DB, `dimensions/${dimension}/subDimensions`);
        
        // Create a document reference for each subDimension
        const subDimensionRef = doc(subDimensionsCollectionRef, encodedSubDimension);

        // Check if the subDimension document already exists
        const subDimensionDoc = await getDoc(subDimensionRef);
        if (subDimensionDoc.exists()) {
          console.log(`Sub-dimension ${subDimension} under dimension ${dimension} already exists. Skipping insertion.`);
          continue;
        }

        // Set the subDimension document
        await setDoc(subDimensionRef, { name: subDimension });

        for (const question of questions) {
          // Encode the question to handle spaces and special characters
          const encodedQuestion = encodeURIComponent(question);

          // Create a collection reference for questions under each subDimension
          const questionsCollectionRef = collection(FIREBASE_DB, `dimensions/${dimension}/subDimensions/${encodedSubDimension}/questions`);

          // Add each question as a new document in the questions collection
          await addDoc(questionsCollectionRef, {
            question: question,
          });
        }
      }
    }
    
    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data: ', error);
  }
};

export { insertDataToFirestore };
