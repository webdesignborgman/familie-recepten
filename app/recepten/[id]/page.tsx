'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import type { Recept } from '@/types/index';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowLeft, Heart as HeartIcon, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { deleteObject, ref as storageRef } from 'firebase/storage';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recept | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    (async () => {
      const snap = await getDoc(doc(db, 'recepten', id));
      if (snap.exists()) {
        const data = snap.data() as Omit<Recept, 'id'>;
        const full = { ...data, id: snap.id };
        setRecipe(full);
        if (user) {
          setFav(full.favoritedBy?.includes(user.uid) ?? false);
        }
      } else {
        setRecipe(null);
      }
      setLoading(false);
    })();
  }, [id, user]);

  // Favoriet toggle
  const handleToggleFav = useCallback(async () => {
    if (!recipe || !user) return;
    const docRef = doc(db, 'recepten', recipe.id);
    const wasFav = fav;
    setFav(!wasFav);
    setSavingFav(true);

    try {
      const current = recipe.favoritedBy ?? [];
      const updated = wasFav ? current.filter(uid => uid !== user.uid) : [...current, user.uid];
      await updateDoc(docRef, { favoritedBy: updated });
      setRecipe(r => (r ? { ...r, favoritedBy: updated } : r));
      toast.success(wasFav ? 'Verwijderd uit favorieten' : 'Toegevoegd aan favorieten');
    } catch {
      setFav(wasFav);
      toast.error('Kon favoriet niet opslaan');
    } finally {
      setSavingFav(false);
    }
  }, [fav, recipe, user]);

  // Verwijder recept (incl. Storage-afbeelding)
  const handleDelete = async () => {
    if (!recipe) return;
    if (!confirm('Weet je zeker dat je dit recept wilt verwijderen?')) return;
    try {
      if (recipe.afbeeldingUrl?.includes('/o/')) {
        const match = decodeURIComponent(recipe.afbeeldingUrl).match(/\/o\/(.+)\?alt/);
        if (match?.[1]) {
          await deleteObject(storageRef(storage, match[1]));
        }
      }
      await deleteDoc(doc(db, 'recepten', recipe.id));
      toast.success('Recept verwijderd!');
      router.push('/recepten');
    } catch {
      toast.error('Verwijderen mislukt');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="pt-20 container mx-auto px-4">
          <div className="text-center py-20">Laden...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="pt-20 container mx-auto px-4">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Recept niet gevonden</h1>
            <Button onClick={() => router.push('/recepten')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar recepten
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.uid === recipe.ownerId;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-96 bg-muted overflow-hidden">
          {/* Afbeelding */}
          {recipe.afbeeldingUrl && (
            <Image
              src={recipe.afbeeldingUrl}
              alt={recipe.titel}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />

          {/* Favorieten knop rechtsboven in image */}
          {user && (
            <button
              className={`
                absolute top-5 right-5 z-20 p-3 rounded-full border
                transition-all shadow-lg bg-white/80 hover:bg-white
                ${fav ? 'border-red-400' : 'border-white/50'}
                ${savingFav ? 'opacity-70 cursor-wait' : ''}
              `}
              disabled={savingFav}
              title={fav ? 'Verwijderen uit favorieten' : 'Toevoegen aan favorieten'}
              onClick={handleToggleFav}
              aria-label={fav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
            >
              <HeartIcon
                className={`w-7 h-7 transition-all duration-200 ${
                  fav
                    ? 'fill-red-500 text-red-500 scale-110 drop-shadow-[0_2px_6px_rgba(244,63,94,0.15)]'
                    : 'text-gray-400'
                }`}
              />
            </button>
          )}

          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-8">
              <Button
                variant="link"
                className="text-white/80 hover:text-white px-0 mb-4 bg-transparent"
                onClick={() => router.push('/recepten')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar recepten
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={recipe.privacy === 'prive' ? 'destructive' : 'secondary'}>
                  {recipe.privacy === 'prive' ? 'Privé' : 'Publiek'}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {recipe.categorieen[0] || 'Onbekend'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{recipe.titel}</h1>
              {recipe.ondertitel && (
                <p className="text-xl text-white/90 mb-6">{recipe.ondertitel}</p>
              )}

              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {recipe.bereidingsTijd}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {recipe.aantalPersonen} personen
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content & Sidebar */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {recipe.beschrijving && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Beschrijving</h2>
                  <p className="text-muted-foreground leading-relaxed">{recipe.beschrijving}</p>
                </div>
              )}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Bereidingswijze</h2>
                <ol className="space-y-4">
                  {recipe.bereidingswijze.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1">
                        {i + 1}
                      </div>
                      <p className="text-muted-foreground leading-relaxed flex-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Sidebar acties */}
            <div className="space-y-6">
              {/* Ingrediënten */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-4">Ingrediënten</h3>
                <ul className="space-y-2">
                  {recipe.ingredienten.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {ing.naam} {ing.hoeveelheid && `(${ing.hoeveelheid})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bewerken & Verwijderen (alleen eigenaar) */}
              {isOwner && (
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Acties</h3>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/recepten/${recipe.id}/bewerken`)}
                    className="w-full flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Bewerken
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Verwijderen
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
