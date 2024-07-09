import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
