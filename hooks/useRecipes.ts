import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
// Importeer je eigen type als je die hebt:
import type { Recept } from '@/types/firestore-schema-familie-recepten';

export function useRecipes(userId?: string) {
  const [recipes, setRecipes] = useState<Recept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'recepten'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snapshot => {
      setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Recept));
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { recipes, loading };
}
