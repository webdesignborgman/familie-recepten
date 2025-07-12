'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Groep, Recept } from '@/types/index';
import Image from 'next/image';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [groepen, setGroepen] = useState<Groep[]>([]);
  const [favRecipes, setFavRecipes] = useState<Recept[]>([]);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, 'groepen'), where('leden', 'array-contains', user.uid))).then(
      snapshot => {
        setGroepen(
          snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Groep, 'id'>) }))
        );
      }
    );
    getDocs(
      query(collection(db, 'recepten'), where('favoritedBy', 'array-contains', user.uid))
    ).then(snapshot => {
      // @ts-expect-error: we overschrijven id altijd veilig met doc.id
      setFavRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Recept) })));
    });
  }, [user]);

  if (!user) return <div className="text-center py-20">Laden...</div>;

  const initials =
    user.displayName
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <div className="max-w-xl mx-auto py-12">
      {/* Avatar header */}
      <div className="flex flex-col items-center mb-8">
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || 'Avatar'}
            width={96}
            height={96}
            className="rounded-full border-4 border-[hsl(142,76%,36%)] object-cover shadow-md"
            priority
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(142,69%,58%)] to-[hsl(210,100%,92%)] flex items-center justify-center text-3xl font-bold text-white border-4 border-[hsl(142,76%,36%)] shadow-md">
            {initials}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-center text-[hsl(142,76%,36%)]">
          {user.displayName}
        </h1>
        <p className="text-sm text-muted-foreground text-center">{user.email}</p>
      </div>

      {/* Mijn groepen */}

      <h2 className="mt-8 mb-3 text-lg font-semibold text-foreground">Mijn groepen</h2>
      <ul className="mb-6 grid gap-4">
        {groepen.length === 0 && (
          <li className="text-muted-foreground text-sm">Nog geen groepen gevonden.</li>
        )}
        {groepen.map(g => (
          <li
            key={g.id}
            className="flex items-center justify-between bg-gradient-to-br from-[hsl(210,100%,92%)] via-white to-[hsl(142,69%,58%)]/10 rounded-xl shadow-sm px-4 py-3 border border-border/50"
          >
            <span className="font-medium text-foreground">{g.naam}</span>
            <Button size="sm" variant="secondary" onClick={() => router.push(`/groepen/${g.id}`)}>
              Beheren
            </Button>
          </li>
        ))}
      </ul>

      {favRecipes.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 text-lg font-semibold text-foreground">Favoriete Recepten</h2>
          <ul className="mb-6 grid gap-4">
            {favRecipes.map(r => (
              <li
                key={r.id}
                className="flex items-center justify-between bg-gradient-to-br from-[hsl(210,100%,92%)] via-white to-[hsl(142,69%,58%)]/10 rounded-xl shadow-sm px-4 py-3 border border-border/50"
              >
                <span className="font-medium text-foreground">{r.titel}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push(`/recepten/${r.id}`)}
                >
                  Bekijken
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Button
        className="w-full bg-gradient-primary text-white font-bold text-lg py-3 rounded-xl shadow hover:opacity-90 transition"
        onClick={() => router.push('/groepen/nieuw')}
      >
        + Groep aanmaken
      </Button>
    </div>
  );
}
