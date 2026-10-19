import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Check environment variables first, then local storage custom config
const storedConfig = localStorage.getItem("aura_firebase_config");
let activeConfig = null;

if (storedConfig) {
  try {
    activeConfig = JSON.parse(storedConfig);
  } catch (e) {
    console.error("Failed to parse stored Firebase config", e);
  }
}

const firebaseConfig = activeConfig || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== ""
);

let app = null;
let db = null;
let storage = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    console.log("🔥 Firebase initialized successfully with project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("Firebase initialization skipped, falling back to local storage store:", err);
  }
}

export { app, db, storage, auth, firebaseConfig };

export function saveCustomFirebaseConfig(config) {
  localStorage.setItem("aura_firebase_config", JSON.stringify(config));
  window.location.reload();
}

export function clearCustomFirebaseConfig() {
  localStorage.removeItem("aura_firebase_config");
  window.location.reload();
}
