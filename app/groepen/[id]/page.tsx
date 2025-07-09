'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Groep } from '@/types/index';
import Image from 'next/image';
import { Trash2, Pencil, X } from 'lucide-react';

type Gebruiker = {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
};

export default function GroepDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [groep, setGroep] = useState<Groep | null>(null);
  const [ledenInfo, setLedenInfo] = useState<Gebruiker[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit naam
  const [naamEdit, setNaamEdit] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Leden toevoegen
  const [nieuweLid, setNieuweLid] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Laad groep info
  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'groepen', id as string));
        const groepData = snap.exists()
          ? { id: snap.id, ...(snap.data() as Omit<Groep, 'id'>) }
          : null;
        setGroep(groepData);
        setNaamEdit(groepData?.naam || '');

        // Leden info ophalen
        if (groepData) {
          const users: Gebruiker[] = [];
          for (const uid of groepData.leden) {
            const userSnap = await getDoc(doc(db, 'users', uid));
            if (userSnap.exists()) {
              users.push({ id: uid, ...(userSnap.data() as Omit<Gebruiker, 'id'>) });
            }
          }
          setLedenInfo(users);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Kon groep niet ophalen');
        setGroep(null);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const isEigenaar = user?.uid === groep?.eigenaar;

  // ===== Naam wijzigen =====
  const handleNaamOpslaan = async () => {
    if (!groep) return;
    try {
      await updateDoc(doc(db, 'groepen', groep.id), { naam: naamEdit.trim() });
      setGroep({ ...groep, naam: naamEdit.trim() });
      setEditMode(false);
    } catch (err: unknown) {
      setError('Naam wijzigen mislukt');

      console.error(err);
    }
  };

  // ===== Lid toevoegen =====
  const handleLidToevoegen = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nieuweLid.trim() || !groep) return;
    setAddLoading(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', nieuweLid.trim()));
      const res = await getDocs(q);
      if (res.empty) {
        setError('Gebruiker niet gevonden');
        setAddLoading(false);
        return;
      }
      const userDoc = res.docs[0];
      const userId = userDoc.id;
      if (groep.leden.includes(userId)) {
        setError('Gebruiker is al lid');
        setAddLoading(false);
        return;
      }
      const nieuweLeden = [...groep.leden, userId];
      await updateDoc(doc(db, 'groepen', groep.id), { leden: nieuweLeden });
      setNieuweLid('');
      // Refresh ledeninfo
      setGroep({ ...groep, leden: nieuweLeden });
      // Je kan beter fetch() opnieuw aanroepen, maar voor nu:
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Toevoegen mislukt');
    }
    setAddLoading(false);
  };

  // ===== Lid verwijderen =====
  const handleVerwijderLid = async (verwijderId: string) => {
    if (!confirm('Weet je zeker dat je dit lid uit de groep wilt verwijderen?')) return;
    try {
      if (!groep) {
        setError('Geen groep geselecteerd');
        return;
      }
      const nieuweLeden = groep.leden.filter(uid => uid !== verwijderId);
      await updateDoc(doc(db, 'groepen', groep.id), { leden: nieuweLeden });
      setLedenInfo(prev => prev.filter(lid => lid.id !== verwijderId));
      setGroep({ ...groep, leden: nieuweLeden });
    } catch (err: unknown) {
      setError('Lid verwijderen mislukt');

      console.error(err);
    }
  };

  // ===== Lid zelf verlaten =====
  const handleVerlaten = async () => {
    if (!groep || !user) return;
    if (groep.eigenaar === user.uid) {
      setError('Eigenaar kan de groep niet verlaten!');
      return;
    }
    try {
      const nieuweLeden = groep.leden.filter(uid => uid !== user.uid);
      await updateDoc(doc(db, 'groepen', groep.id), { leden: nieuweLeden });
      router.push('/profiel');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Groep verlaten mislukt');
    }
  };

  // ===== Groep verwijderen =====
  const handleGroepVerwijderen = async () => {
    if (!groep) return;
    if (!confirm('Weet je zeker dat je deze groep permanent wilt verwijderen?')) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'groepen', groep.id));
      router.push('/profiel');
    } catch (err: unknown) {
      setError('Groep verwijderen mislukt');

      console.error(err);
    }
    setDeleteLoading(false);
  };

  if (loading) return <div className="py-16 text-center text-muted-foreground">Laden...</div>;
  if (!groep) return <div className="py-16 text-center text-destructive">Groep niet gevonden</div>;

  return (
    <div className="max-w-xl mx-auto py-12">
      {/* Groepsnaam en edit */}
      <div className="flex flex-col items-center mb-2">
        {!editMode ? (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[hsl(142,76%,36%)]">{groep.naam}</h1>
            {isEigenaar && (
              <Button
                size="icon"
                variant="outline"
                title="Naam bewerken"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2 items-center mt-2">
            <Input
              value={naamEdit}
              onChange={e => setNaamEdit(e.target.value)}
              className="w-48"
              autoFocus
            />
            <Button
              size="sm"
              className="bg-[hsl(142,76%,36%)] text-white hover:bg-[hsl(142,84%,24%)]"
              onClick={handleNaamOpslaan}
            >
              Opslaan
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditMode(false);
                setNaamEdit(groep.naam);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <p className="mb-6 text-center text-muted-foreground">
        <b>Eigenaar:</b>{' '}
        {ledenInfo.find(lid => lid.id === groep.eigenaar)?.displayName || groep.eigenaar}
      </p>
      <h2 className="mb-3 text-lg font-semibold text-foreground">Leden</h2>
      <ul className="mb-6 grid gap-3">
        {ledenInfo.length === 0 && (
          <li className="text-muted-foreground text-sm">Nog geen leden.</li>
        )}
        {ledenInfo.map(lid => (
          <li
            key={lid.id}
            className="flex items-center gap-3 bg-gradient-to-br from-[hsl(210,100%,92%)] via-white to-[hsl(142,69%,58%)]/10 rounded-xl shadow-sm px-3 py-2 border border-border/50"
          >
            {lid.photoURL ? (
              <Image
                src={lid.photoURL}
                alt={lid.displayName}
                width={38}
                height={38}
                className="rounded-full border border-[hsl(142,76%,36%)] object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(142,69%,58%)] to-[hsl(210,100%,92%)] flex items-center justify-center text-lg font-bold text-white border border-[hsl(142,76%,36%)]">
                {lid.displayName[0]}
              </div>
            )}
            <span className="flex-1 font-medium text-foreground">
              {lid.displayName} <span className="text-xs text-muted-foreground">({lid.email})</span>
              {lid.id === groep.eigenaar && (
                <span className="ml-2 text-xs text-[hsl(142,76%,36%)] font-semibold">
                  (eigenaar)
                </span>
              )}
            </span>
            {/* Lid verwijderen: alleen als eigenaar én niet zichzelf */}
            {isEigenaar && lid.id !== groep.eigenaar && (
              <Button
                size="icon"
                variant="destructive"
                title="Verwijderen"
                onClick={() => handleVerwijderLid(lid.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
      {/* Lid toevoegen */}
      {isEigenaar && (
        <form onSubmit={handleLidToevoegen} className="flex gap-2 mt-2 mb-5">
          <Input
            value={nieuweLid}
            onChange={e => setNieuweLid(e.target.value)}
            placeholder="E-mail adres nieuw lid"
            disabled={addLoading}
            className="bg-white"
            autoComplete="off"
          />
          <Button
            type="submit"
            className="bg-gradient-primary text-white font-bold"
            disabled={addLoading || !nieuweLid.trim()}
          >
            {addLoading ? 'Toevoegen...' : 'Toevoegen'}
          </Button>
        </form>
      )}
      {error && <div className="mb-3 text-destructive text-center text-sm">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button
          variant="outline"
          className="w-full hover:bg-[hsl(142,84%,24%)]"
          onClick={() => router.push('/profiel')}
        >
          Terug naar profiel
        </Button>
        {user && !isEigenaar && (
          <Button variant="destructive" className="w-full" onClick={handleVerlaten}>
            Groep verlaten
          </Button>
        )}
        {/* Groep verwijderen alleen voor eigenaar */}
        {isEigenaar && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleGroepVerwijderen}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Groep verwijderen...' : 'Groep verwijderen'}
          </Button>
        )}
      </div>
    </div>
  );
}
