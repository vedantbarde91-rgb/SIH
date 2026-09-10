import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Fallback configuration if .env is not yet configured by the user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForPrototypeNER2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ner-landslide-mvp.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ner-landslide-mvp",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ner-landslide-mvp.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

let app;
let auth = null;
let db = null;
let storage = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn("Firebase initialization warning (running in mock/prototype mode):", err.message);
}

export { app, auth, db, storage };
