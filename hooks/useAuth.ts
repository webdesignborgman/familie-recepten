'use client';
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase'; // <-- pad eventueel aanpassen

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
