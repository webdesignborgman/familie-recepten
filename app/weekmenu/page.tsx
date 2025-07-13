'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { WeekmenuCardList } from '@/components/weekmenu/WeekmenuCardList';
import { Button } from '@/components/ui/button';
import type { Weekmenu } from '@/types';

export default function WeekmenuPage() {
  const { user, loading: authLoading } = useAuth();
  const [weekmenu, setWeekmenu] = useState<Weekmenu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Weekmenu:', weekmenu);
  }, [weekmenu]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setWeekmenu(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetchWeekmenu = async () => {
      try {
        // 1. Haal alle groepen op waar user lid van is
        const groepQ = query(collection(db, 'groepen'), where('leden', 'array-contains', user.uid));
        const groepSnap = await getDocs(groepQ);
        const groepen = groepSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (groepen.length === 0) {
          setWeekmenu(null);
          setLoading(false);
          return;
        }
        // 2. Neem de eerste groep waar user in zit (evt. uitbreiden met dropdown)
        const groupId = groepen[0].id;

        // 3. Zoek het weekmenu voor deze groep
        const q = query(collection(db, 'weekmenus'), where('groupId', '==', groupId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          setWeekmenu({
            id: doc.id,
            ...(doc.data() as Omit<Weekmenu, 'id'>),
          });
        } else {
          setWeekmenu(null);
        }
      } catch (e) {
        console.error('Fout bij ophalen weekmenu:', e);
        setWeekmenu(null);
      }
      setLoading(false);
    };

    fetchWeekmenu();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="px-4 py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">Weekmenu</h1>
        <div>Laden…</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Weekmenu</h1>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <p className="mb-4">Log in om je weekmenu te bekijken.</p>
        </div>
      </main>
    );
  }

  if (!weekmenu) {
    return (
      <main className="max-w-3xl mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Weekmenu</h1>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <p className="mb-4">
            Je hebt nog geen weekmenu. Maak er één aan! <br />
            (Of je zit nog in geen groep.)
          </p>
          <Button asChild>
            <a href="/weekmenu/nieuw">Nieuw weekmenu aanmaken</a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Weekmenu</h1>
      {weekmenu && weekmenu.dagen ? (
        <WeekmenuCardList weekmenuId={weekmenu.id} dagen={weekmenu.dagen} />
      ) : (
        <div>Weekmenu laden mislukt...</div>
      )}
    </main>
  );
}
