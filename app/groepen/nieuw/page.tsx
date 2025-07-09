'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NewGroepPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [naam, setNaam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!naam.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'groepen'), {
        naam,
        eigenaar: user.uid,
        leden: [user.uid],
        aangemaaktOp: serverTimestamp(),
      });
      router.push('/profiel');
    } catch (err: unknown) {
      let message = 'Groep aanmaken mislukt';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gradient-to-tr from-white via-[hsl(142,69%,58%)]/10 to-[hsl(210,100%,92%)] p-8 rounded-2xl shadow-2xl border-none">
        <h1 className="text-[hsl(142,76%,36%)] text-2xl font-bold tracking-tight mb-3 text-center">
          Nieuwe groep aanmaken
        </h1>
        <p className="text-center text-muted-foreground mb-6 text-sm">
          Maak eenvoudig een nieuwe groep aan voor je familie, vrienden of clubje.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={naam}
            onChange={e => setNaam(e.target.value)}
            placeholder="Groepsnaam"
            disabled={loading}
            className="bg-white"
            autoFocus
            maxLength={40}
          />
          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button
            type="submit"
            className="w-full bg-gradient-primary text-white font-bold text-lg py-2 rounded-xl hover:opacity-90 transition"
            disabled={loading || !naam.trim()}
          >
            {loading ? 'Bezig...' : 'Groep aanmaken'}
          </Button>
        </form>
        <Button
          variant="link"
          className="w-full mt-2 text-sm text-[hsl(210,100%,56%)] underline underline-offset-4"
          onClick={() => router.push('/profiel')}
        >
          Terug naar profiel
        </Button>
      </div>
    </div>
  );
}
