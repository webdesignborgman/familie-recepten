'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import RecipesHero from '@/components/recepten/RecipesHero';
import RecipeCard from '@/components/recepten/RecipeCard';
import RecipeFilter from '@/components/recepten/RecipeFilter';

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Recept, Groep } from '@/types/index';

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

  // Filter state
  const [zoekterm, setZoekterm] = useState('');
  const [geselecteerdeCategorieen, setGeselecteerdeCategorieen] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setLoadingRecipes(false);
      return;
    }
    setLoadingRecipes(true);

    let unsubscribe: (() => void) | undefined;

    async function fetchWithGroups() {
      const groepQ = query(collection(db, 'groepen'), where('leden', 'array-contains', user!.uid));
      const groepSnap = await getDocs(groepQ);
      const groepsledenIds = Array.from(
        new Set(
          groepSnap.docs
            .map(doc => (doc.data() as Groep).leden)
            .flat()
            .filter((uid): uid is string => typeof uid === 'string')
        )
      );

      const receptenQ = query(collection(db, 'recepten'), orderBy('titel'));
      unsubscribe = onSnapshot(receptenQ, snap => {
        const alle = snap.docs.map(mapFirestoreRecipe);
        const mapRez = new Map<string, Recept>();

        alle.filter(r => r.ownerId === user!.uid).forEach(r => mapRez.set(r.id, r));
        alle.filter(r => r.privacy === 'publiek').forEach(r => mapRez.set(r.id, r));
        alle
          .filter(
            r =>
              r.privacy === 'prive' && groepsledenIds.includes(r.ownerId) && r.ownerId !== user!.uid
          )
          .forEach(r => mapRez.set(r.id, r));

        setRecipes(Array.from(mapRez.values()));
        setLoadingRecipes(false);
      });
    }

    fetchWithGroups();

    return () => {
      unsubscribe?.();
    };
  }, [user]);

  const categorieOpties = Array.from(new Set(recipes.flatMap(r => r.categorieen)));

  // Filteren (clientside)
  const gefilterdeRecipes = recipes.filter(recipe => {
    const q = zoekterm.trim().toLowerCase();
    const matchZoek =
      !zoekterm ||
      recipe.titel.toLowerCase().includes(q) ||
      (recipe.ondertitel ?? '').toLowerCase().includes(q) ||
      recipe.ingredienten.some(
        i => i.naam.toLowerCase().includes(q) || i.hoeveelheid.toLowerCase().includes(q)
      );
    const matchCat =
      geselecteerdeCategorieen.length === 0 ||
      recipe.categorieen.some(cat => geselecteerdeCategorieen.includes(cat));
    return matchZoek && matchCat;
  });

  if (loading) return <div className="text-center py-16">Laden...</div>;

  if (!user) {
    return (
      <div>
        <RecipesHero />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-4">Familie Recepten (demo)</h1>
          <div className="mb-4 space-y-2">
            <div className="p-4 rounded-xl bg-[hsl(210,100%,92%)]">
              <strong>Klassieke lasagne</strong>
              <p className="text-sm text-muted-foreground">
                Ingrediënten: gehakt, tomaten, bechamelsaus...
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[hsl(31,81%,91%)]">
              <strong>Vegetarische curry</strong>
              <p className="text-sm text-muted-foreground">
                Ingrediënten: kikkererwten, kokosmelk, spinazie...
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border mt-6 text-center">
            <p>
              Maak een gratis account om je eigen familie recepten toe te voegen, te bewaren en te
              delen!{' '}
              <a
                href="/auth/register"
                className="text-[hsl(210,100%,56%)] font-medium underline underline-offset-2 hover:text-[hsl(142,76%,36%)]"
              >
                Maak nu je account aan →
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RecipesHero
        filterbar={
          <RecipeFilter
            categories={categorieOpties}
            onFilter={(search, cats) => {
              setZoekterm(search);
              setGeselecteerdeCategorieen(cats);
            }}
          />
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-10 mt-10">
        {loadingRecipes ? (
          <div className="text-center text-muted-foreground py-10">Recepten laden...</div>
        ) : gefilterdeRecipes.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">Geen recepten gevonden.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gefilterdeRecipes.map(recipe => (
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
    </div>
  );
}
