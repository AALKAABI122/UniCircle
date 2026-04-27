import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2z5tLo15wFW_R0m0l1a8qgKCy5cn12wI",
  authDomain: "unicircle-6.firebaseapp.com",
  projectId: "unicircle-6",
  storageBucket: "unicircle-6.firebasestorage.app",
  messagingSenderId: "862762967797",
  appId: "1:862762967797:web:39a76d641dc92efb5adbbc",
  measurementId: "G-XH8LK6VST2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;