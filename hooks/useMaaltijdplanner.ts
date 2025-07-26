'use client';
import { useEffect, useState, useCallback } from 'react';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { PlannerDay, Category, DayItem } from '../types/maaltijdplanner';

interface UseMaaltijdplannerResult {
  planner: PlannerDay[] | null;
  loading: boolean;
  error: string | null;
  updateDay: (index: number, day: PlannerDay) => Promise<void>;
  updateCategory: (index: number, category: Category, item: DayItem) => Promise<void>;
  clearCategory: (index: number, category: Category) => Promise<void>;
}

const defaultDays: PlannerDay[] = [
  { dag: 'Zaterdag', datum: '01', items: {} as Record<Category, DayItem> },
  { dag: 'Zondag', datum: '02', items: {} as Record<Category, DayItem> },
  { dag: 'Maandag', datum: '03', items: {} as Record<Category, DayItem> },
  { dag: 'Dinsdag', datum: '04', items: {} as Record<Category, DayItem> },
  { dag: 'Woensdag', datum: '05', items: {} as Record<Category, DayItem> },
  { dag: 'Donderdag', datum: '06', items: {} as Record<Category, DayItem> },
  { dag: 'Vrijdag', datum: '07', items: {} as Record<Category, DayItem> },
  { dag: 'Zaterdag', datum: '08', items: {} as Record<Category, DayItem> },
  { dag: 'Zondag', datum: '09', items: {} as Record<Category, DayItem> },
].map(day => ({
  ...day,
  items: {
    Ontbijt: { titel: '', boek: '', pagina: '' },
    Snack1: { titel: '', boek: '', pagina: '' },
    Lunch: { titel: '', boek: '', pagina: '' },
    Snack2: { titel: '', boek: '', pagina: '' },
    Avondeten: { titel: '', boek: '', pagina: '' },
    BakjeGeluk: { titel: '', boek: '', pagina: '' },
  },
}));

export function useMaaltijdplanner(): UseMaaltijdplannerResult {
  const { user } = useAuth();
  const [planner, setPlanner] = useState<PlannerDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const ref = doc(db, 'maaltijdplanners', user.uid);
    getDoc(ref)
      .then(snapshot => {
        if (snapshot.exists()) {
          setPlanner(snapshot.data().days as PlannerDay[]);
        } else {
          setDoc(ref, { days: defaultDays }).then(() => setPlanner(defaultDays));
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const updateDay = useCallback(
    async (index: number, day: PlannerDay) => {
      if (!user) return;
      const db = getFirestore();
      const ref = doc(db, 'maaltijdplanners', user.uid);
      const newPlanner = planner ? [...planner] : defaultDays;
      newPlanner[index] = day;
      await updateDoc(ref, { days: newPlanner });
      setPlanner(newPlanner);
    },
    [user, planner]
  );

  const updateCategory = useCallback(
    async (index: number, category: Category, item: DayItem) => {
      if (!user) return;
      const db = getFirestore();
      const ref = doc(db, 'maaltijdplanners', user.uid);
      const newPlanner = planner ? [...planner] : defaultDays;
      newPlanner[index].items[category] = item;
      await updateDoc(ref, { days: newPlanner });
      setPlanner(newPlanner);
    },
    [user, planner]
  );

  const clearCategory = useCallback(
    async (index: number, category: Category) => {
      await updateCategory(index, category, { titel: '', boek: '', pagina: '' });
    },
    [updateCategory]
  );

  return { planner, loading, error, updateDay, updateCategory, clearCategory };
}
