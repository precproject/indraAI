import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// This is the combination to our secure cloud safe.
// When you create a free Firebase project, you will paste your actual keys here.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// We are unlocking the building
const app = initializeApp(firebaseConfig);

// This is the guard who checks ID cards (Phone numbers/OTP)
export const auth = getAuth(app);

// This is the actual filing cabinet where we store the folders
export const db = getFirestore(app);