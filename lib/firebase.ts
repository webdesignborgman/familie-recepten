import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  // DocumentData,
} from 'firebase/firestore';
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
import { doc, setDoc, getDoc } from 'firebase/firestore';

import type { ReceptInput, Weekmenu } from '@/types/index'; //WeekmenuDag

// ===================
// Firebase config
// ===================
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

// ===================
// User document in Firestore
// ===================
export async function ensureUserDoc(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
}) {
  if (!user.uid || !user.email) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName ?? '',
      email: user.email,
      photoURL: user.photoURL ?? '',
    });
  } else {
    // Update alleen als displayName of photoURL is gewijzigd
    const data = snap.data();
    if (data.photoURL !== user.photoURL || data.displayName !== user.displayName) {
      await setDoc(
        userRef,
        {
          ...data,
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
        },
        { merge: true }
      );
    }
  }
}

// ===================
// Auth functies
// ===================

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

// ===================
// Recepten toevoegen (type safe)
// ===================

export async function addRecipeToFirestore(recipe: ReceptInput, userId: string): Promise<void> {
  await addDoc(collection(db, 'recepten'), {
    ...recipe,
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    favoritedBy: [],
    sharedWith: recipe.privacy === 'gedeeld' ? recipe.sharedWith || [] : [],
  });
}

// ===================
// Weekmenu ophalen (type safe)
// ===================

/**
 * Haal het weekmenu op voor een specifieke gebruiker
 * Gebruik dit in server of client components.
 *
 * @param userId - het Firebase UID van de gebruiker
 * @returns Weekmenu of null
 */
export async function getWeekmenuForUser(userId?: string): Promise<Weekmenu | null> {
  // userId mag worden meegegeven (server-side), of uit de client gehaald worden (auth.currentUser)
  let effectiveUserId = userId;

  // Indien niet meegegeven, probeer userId uit Firebase Auth (client-side!)
  if (!effectiveUserId && typeof window !== 'undefined') {
    effectiveUserId = auth.currentUser?.uid ?? undefined;
  }
  if (!effectiveUserId) return null;

  const ref = collection(db, 'weekmenus');
  const q = query(ref, where('userId', '==', effectiveUserId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data() as Omit<Weekmenu, 'id'>;

  return {
    id: docSnap.id,
    ...data,
  };
}
