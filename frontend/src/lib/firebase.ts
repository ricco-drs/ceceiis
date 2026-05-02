// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9kx-INT1Zp5WgGh5s-Q488a7Sm2XYa4Y",
  authDomain: "ceceiis.firebaseapp.com",
  projectId: "ceceiis",
  storageBucket: "ceceiis.firebasestorage.app",
  messagingSenderId: "207128495823",
  appId: "1:207128495823:web:4d2e2461d19ac40f1f19ba",
  measurementId: "G-LFWD9VX856"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (only in client-side and if supported)
export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export default app;
