import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: process.env.REACT_PUBLIC_FIREBASE_APP_API_KEY,
//     authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//     projectId: process.env.REACT_APP_PROJECT_ID,
//     storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//     messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
//     appId: process.env.REACT_APP_APP_ID,
// };

const firebaseConfig = {
    apiKey: "AIzaSyB61tIDywV7pCRhCtdb-LfOYw5T_t83zb8",
    authDomain: "fir-db-98cd3.firebaseapp.com",
    projectId: "fir-db-98cd3",
    storageBucket: "fir-db-98cd3.firebasestorage.app",
    messagingSenderId: "887831005863",
    appId: "1:887831005863:web:71541aca2715b1fa196982"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Export the services
export {db, app, auth};