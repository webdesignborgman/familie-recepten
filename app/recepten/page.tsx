'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import RecipesHero from '@/components/recepten/RecipesHero';
import RecipeCard from '@/components/recepten/RecipeCard';

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Recept } from '@/types/index';

// Helper: type-safe mapping van Firestore doc naar Recept
function mapFirestoreRecipe(doc: QueryDocumentSnapshot<DocumentData>): Recept {
  const data = doc.data();

  return {
    id: doc.id,
    titel: data.titel,
    ondertitel: data.ondertitel,
    categorieen: data.categorieen || [],
    ingredienten: data.ingredienten || [],
    bereidingswijze: data.bereidingswijze || [],
    bereidingsTijd: data.bereidingsTijd || '-',
    aantalPersonen: data.aantalPersonen || 1,
    afbeeldingUrl: data.afbeeldingUrl || undefined,
    beschrijving: data.beschrijving || '',
    privacy: data.privacy,
    favoritedBy: data.favoritedBy || [],
    ownerId: data.ownerId || '',
    groupId: data.groupId,
    sharedWith: data.sharedWith,
    notities: data.notities,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default function Page() {
  const { user, loading } = useAuth();
  const [recipes, setRecipes] = useState<Recept[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  // Laad recepten uit Firestore als ingelogd
  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setLoadingRecipes(false);
      return;
    }
    setLoadingRecipes(true);

    const col = collection(db, 'recepten');
    const q = query(col, orderBy('titel'));

    const unsub = onSnapshot(q, snapshot => {
      const result = snapshot.docs
        .map(mapFirestoreRecipe)
        .filter(recipe => recipe.privacy === 'publiek' || recipe.ownerId === user.uid);
      setRecipes(result);
      setLoadingRecipes(false);
    });

    return () => unsub();
  }, [user]);

  if (loading) return <div>Laden...</div>;

  return (
    <div>
      <RecipesHero />

      {user ? (
        <div className="max-w-6xl mx-auto px-4 py-10">
          {loadingRecipes ? (
            <div className="text-center text-muted-foreground py-10">Recepten laden...</div>
          ) : recipes.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">Geen recepten gevonden.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.titel}
                  subtitle={recipe.ondertitel || ''}
                  category={recipe.categorieen[0] || 'Onbekend'}
                  cookingTime={recipe.bereidingsTijd}
                  servings={recipe.aantalPersonen}
                  image={recipe.afbeeldingUrl}
                  isPrivate={recipe.privacy === 'prive'}
                  onClick={() => (window.location.href = `/recepten/${recipe.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Niet ingelogd: demo/teaser + call-to-action
        <div>
          <h1 className="text-2xl font-bold mb-4">Familie Recepten (demo)</h1>
          <div className="mb-4">
            <div className="p-4 rounded-xl bg-[hsl(210,100%,92%)] mb-2">
              <strong>Klassieke lasagne</strong> <br />
              <span className="text-sm text-muted-foreground">
                Ingrediënten: gehakt, tomaten, bechamelsaus...
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[hsl(31,81%,91%)]">
              <strong>Vegetarische curry</strong> <br />
              <span className="text-sm text-muted-foreground">
                Ingrediënten: kikkererwten, kokosmelk, spinazie...
              </span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border mt-6">
            <p>
              Maak een gratis account om je eigen familie recepten toe te voegen, te bewaren en te
              delen! <br />
              <a
                href="/auth/register"
                className="text-[hsl(210,100%,56%)] font-medium underline underline-offset-2 hover:text-[hsl(142,76%,36%)]"
              >
                Maak nu je account aan &rarr;
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
