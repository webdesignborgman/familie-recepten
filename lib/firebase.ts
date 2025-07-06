import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { toast } from 'sonner';

// Voeg || "" toe aan elke env var voor typesafety
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

/** Google login (met feedback) */
export const loginWithGoogle = async (): Promise<UserCredential | void> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    toast.success(`Welkom ${result.user.displayName || ''}!`);
    return result;
  } catch (error: unknown) {
    toast.error('Inloggen met Google mislukt. Probeer opnieuw!');
    console.error(error);
  }
};

/** Email/password login (met feedback) */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential | void> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    toast.success(`Welkom terug!`);
    return result;
  } catch (error: unknown) {
    toast.error('Ongeldige gegevens. Probeer opnieuw!');
    console.error(error);
  }
};

/** Uitloggen (met feedback) */
export const logout = async () => {
  try {
    await signOut(auth);
    toast.success('Je bent uitgelogd.');
  } catch (error: unknown) {
    toast.error('Uitloggen mislukt!');
    console.error(error);
  }
};
