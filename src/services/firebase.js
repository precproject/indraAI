import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo_api_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shetkari-mitra-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shetkari-mitra.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const dbService = {
  async saveDocument(collectionName, data) {
    if (!data.id) {
      data.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return data;
  },

  async getDocumentsByField(collectionName, field, value) {
    const q = query(collection(db, collectionName), where(field, "==", value));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });
    return results;
  },

  async getDocumentById(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  },

  async deleteDocument(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id));
  }
};