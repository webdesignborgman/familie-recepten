'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import type { WeekmenuDag } from '@/types';

const DAGNAMEN = [
  'Zaterdag',
  'Zondag',
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag',
];

function createEmptyWeekmenu(): WeekmenuDag[] {
  return DAGNAMEN.map((dag, i) => ({
    id: `${dag}-${i}`,
    dag,
    datum: '',
    dienst: '',
    maaltijd: '',
    notitie: '',
    receptenIds: [],
  }));
}

export default function NieuwWeekmenuPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    async function create() {
      if (!user) {
        router.replace('/weekmenu');
        return;
      }

      // 1. Zoek de eerste groep waar user lid van is
      const groepQ = query(collection(db, 'groepen'), where('leden', 'array-contains', user.uid));
      const groepSnap = await getDocs(groepQ);
      const groepen = groepSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const groupId = groepen[0]?.id;

      if (!groupId) {
        alert('Je zit nog in geen groep. Maak eerst een groep aan.');
        router.replace('/weekmenu');
        return;
      }

      // 2. Bestaat er al een weekmenu voor deze groep?
      const weekmenuQ = query(collection(db, 'weekmenus'), where('groupId', '==', groupId));
      const weekmenuSnap = await getDocs(weekmenuQ);
      if (!weekmenuSnap.empty) {
        router.replace('/weekmenu');
        return;
      }

      // 3. Maak weekmenu aan
      const dagen = createEmptyWeekmenu();
      await addDoc(collection(db, 'weekmenus'), {
        groupId,
        dagen,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.replace('/weekmenu');
    }

    create();
  }, [user, authLoading, router]);

  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Nieuw weekmenu wordt aangemaakt…</h1>
      <p>Even geduld, je wordt doorgestuurd.</p>
    </main>
  );
}
