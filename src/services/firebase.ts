import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Real Live Firebase Web Configuration for GEN-TOUCH
const firebaseConfig = {
  apiKey: "AIzaSyDQNc6RurK4p0OhKxAGgpBH84pyFob3mj4",
  authDomain: "gen-touch.firebaseapp.com",
  projectId: "gen-touch",
  storageBucket: "gen-touch.firebasestorage.app",
  messagingSenderId: "34250013744",
  appId: "1:34250013744:web:69a73f8d55c985db1181f5"
};

// Singleton initialization to prevent multiple apps in HMR / fast refresh
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Super Admin Email for GEN-TOUCH
export const SUPER_ADMIN_EMAIL = "tanjimislamtajofficial@gmail.com";

export default app;