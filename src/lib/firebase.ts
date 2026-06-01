// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHvYE6nPZZ3HOddfdyBmJUU7y8PscbFw4",
  authDomain: "studio-5255428477-c7c74.firebaseapp.com",
  projectId: "studio-5255428477-c7c74",
  storageBucket: "studio-5255428477-c7c74.firebasestorage.app",
  messagingSenderId: "293281064463",
  appId: "1:293281064463:web:17988811857b84fa46657a"
};

// Initialize Firebase (checking if it already exists for Next.js SSR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore, Auth, and Storage with Long Polling fallback for WebChannel bugs
const db = (() => {
  try {
    return initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch (e) {
    return getFirestore(app);
  }
})();
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
