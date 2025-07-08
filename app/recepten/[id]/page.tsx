'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import type { Recept } from '@/types/index';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowLeft, Heart, Share, Pencil, Trash2 } from 'lucide-react';
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

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchRecipe = async () => {
      const ref = doc(db, 'recepten', id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as Omit<Recept, 'id'>;
        setRecipe({ ...data, id: snap.id });
      } else {
        setRecipe(null);
      }
      setLoading(false);
    };

    fetchRecipe();
  }, [id]);

  // Verwijderen van een recept (inclusief afbeelding)
  const handleDelete = async (recipeId: string) => {
    if (!recipe) return;
    if (confirm('Weet je zeker dat je dit recept wilt verwijderen?')) {
      try {
        // Verwijder eerst afbeelding uit Storage als die er is
        if (recipe.afbeeldingUrl && recipe.afbeeldingUrl.includes('/o/')) {
          try {
            const match = decodeURIComponent(recipe.afbeeldingUrl).match(/\/o\/(.+)\?alt/);
            if (match && match[1]) {
              const path = match[1];
              await deleteObject(storageRef(storage, path));
            }
          } catch (imgErr) {
            // Afbeelding niet verwijderd? Geeft niks, we gaan wel door met het verwijderen van het recept zelf
            console.warn('Afbeelding niet verwijderd uit storage:', imgErr);
          }
        }

        await deleteDoc(doc(db, 'recepten', recipeId));
        toast.success('Recept (en afbeelding) verwijderd!');
        router.push('/recepten');
      } catch (err) {
        toast.error('Verwijderen mislukt, probeer opnieuw.');
        console.error(err);
      }
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-96 bg-muted overflow-hidden">
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
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-8">
              <Button
                variant="link"
                className="text-white/80 hover:text-white mb-4 px-0 bg-transparent"
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
                  <span>{recipe.bereidingsTijd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{recipe.aantalPersonen} personen</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                  {/* Description */}
                  {recipe.beschrijving && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">Beschrijving</h2>
                      <p className="text-muted-foreground leading-relaxed">{recipe.beschrijving}</p>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">Bereidingswijze</h2>
                    <ol className="space-y-4">
                      {recipe.bereidingswijze.map((step, index) => (
                        <li key={index} className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1">
                            {index + 1}
                          </div>
                          <p className="text-muted-foreground leading-relaxed flex-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Ingredients */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Ingrediënten</h3>
                    <ul className="space-y-2">
                      {recipe.ingredienten.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {ingredient.naam}
                            {ingredient.hoeveelheid ? ` (${ingredient.hoeveelheid})` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Acties</h3>
                    <div className="space-y-3">
                      <Button
                        className={`w-full bg-gradient-primary hover:opacity-90 ${fav ? 'opacity-60' : ''}`}
                        onClick={() => setFav(!fav)}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 ${fav ? 'fill-current text-red-400' : ''}`}
                        />
                        <span className="text-sm">
                          {fav ? 'Favoriet!' : 'Aan favorieten toevoegen'}
                        </span>
                      </Button>
                      <Button variant="outline" className="w-full text-sm" disabled>
                        <Share className="w-4 h-4 mr-2" />
                        Recept delen{' '}
                        <span className="ml-1 text-xs text-muted-foreground">(binnenkort)</span>
                      </Button>
                    </div>
                    {/* Divider & Owner actions */}
                    {recipe.ownerId === user?.uid && (
                      <>
                        <div className="my-5 border-t border-muted-foreground/20" />
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => router.push(`/recepten/${recipe.id}/bewerken`)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Bewerken
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleDelete(recipe.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Verwijderen
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
