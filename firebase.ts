import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKdlGB9dnWN-5ex6IIRf04fDlWXDHeAXY",
  authDomain: "course-project-74e99.firebaseapp.com",
  databaseURL: "https://course-project-74e99-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "course-project-74e99",
  storageBucket: "course-project-74e99.appspot.com",
  messagingSenderId: "989114760657",
  appId: "1:989114760657:web:dca865d8ad2b0479d6f4f0",
  measurementId: "G-MBMYFZVRJB"
};

// Inicializar o app Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);

// Inicializar o Firebase Auth com persistência usando AsyncStorage
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar o Firestore
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
