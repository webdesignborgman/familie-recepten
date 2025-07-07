import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  UserCredential,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { toast } from 'sonner';

// Typesafe config met fallback (""), zoals jij had
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

/** Login met Google (met feedback) */
export const loginWithGoogle = async (): Promise<UserCredential | undefined> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    toast.success(`Welkom ${result.user.displayName || ''}!`);
    return result;
  } catch (caught: unknown) {
    let message = 'Inloggen met Google mislukt. Probeer opnieuw!';
    if (caught instanceof Error) {
      message = caught.message;
    }
    toast.error(message);
    console.error(caught);
    return undefined;
  }
};

/** Login met email/wachtwoord (met feedback) */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential | undefined> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    toast.success('Welkom terug!');
    return result;
  } catch (caught: unknown) {
    let message = 'Ongeldige gegevens. Probeer opnieuw!';
    if (caught instanceof Error) {
      message = caught.message;
    }
    toast.error(message);
    console.error(caught);
    return undefined;
  }
};

/** Registreren met email/wachtwoord (met feedback) */
export const registerWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential | undefined> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    toast.success('Account aangemaakt, welkom!');
    return result;
  } catch (caught: unknown) {
    let message = 'Registratie mislukt. Probeer een ander e-mailadres.';
    if (caught instanceof Error) {
      message = caught.message;
    }
    toast.error(message);
    console.error(caught);
    return undefined;
  }
};

/** Stuur wachtwoord-reset e-mail (met feedback) */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    toast.success('Check je inbox voor het reset-linkje.');
  } catch (caught: unknown) {
    let message = 'Kon geen reset-link versturen. Probeer opnieuw.';
    if (caught instanceof Error) {
      message = caught.message;
    }
    toast.error(message);
    console.error(caught);
  }
};

/** Uitloggen (met feedback) */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    toast.success('Je bent uitgelogd.');
  } catch (caught: unknown) {
    let message = 'Uitloggen mislukt!';
    if (caught instanceof Error) {
      message = caught.message;
    }
    toast.error(message);
    console.error(caught);
  }
};
