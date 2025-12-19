import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Firebase 設定區 ---
const firebaseConfig = {
  apiKey: "AIzaSyDwBtBbVpJ5RU2LkSVaDsGVbd2QAITx7mA",
  authDomain: "my-family-trip.firebaseapp.com",
  projectId: "my-family-trip",
  storageBucket: "my-family-trip.firebasestorage.app",
  messagingSenderId: "757482722852",
  appId: "1:757482722852:web:2b35e7e4fcd1ab6c362ab1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);