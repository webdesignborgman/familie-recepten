'use client';

import { useEffect, useState, useCallback } from 'react';
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
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Recept, Groep } from '@/types/index';

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

  const [zoekterm, setZoekterm] = useState('');
  const [geselecteerdeCategorieen, setGeselecteerdeCategorieen] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Favorieten logica
  const toggleFavorite = useCallback(
    async (id: string, newState: boolean) => {
      if (!user) return;
      const refDoc = doc(db, 'recepten', id);
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;
      const current = recipe.favoritedBy || [];
      const updated = newState ? [...current, user.uid] : current.filter(x => x !== user.uid);
      await updateDoc(refDoc, { favoritedBy: updated });
    },
    [recipes, user]
  );

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setLoadingRecipes(false);
      return;
    }

    setLoadingRecipes(true);
    let unsubscribe: () => void;

    (async () => {
      const uid = user.uid;
      // Groepsleden ophalen
      const groepQ = query(collection(db, 'groepen'), where('leden', 'array-contains', uid));
      const groepSnap = await getDocs(groepQ);
      const groepsledenIds = Array.from(
        new Set(
          groepSnap.docs
            .map(d => (d.data() as Groep).leden)
            .flat()
            .filter((x): x is string => typeof x === 'string')
        )
      );

      // Recepten realtime ophalen
      const receptenQ = query(collection(db, 'recepten'), orderBy('titel'));
      unsubscribe = onSnapshot(receptenQ, snap => {
        const alle = snap.docs.map(mapFirestoreRecipe);
        const mapRez = new Map<string, Recept>();

        // Eigen recepten
        alle.filter(r => r.ownerId === uid).forEach(r => mapRez.set(r.id, r));
        // Publieke recepten
        alle.filter(r => r.privacy === 'publiek').forEach(r => mapRez.set(r.id, r));
        // Privé-recepten van groepsleden
        alle
          .filter(
            r => r.privacy === 'prive' && groepsledenIds.includes(r.ownerId) && r.ownerId !== uid
          )
          .forEach(r => mapRez.set(r.id, r));

        setRecipes(Array.from(mapRez.values()));
        setLoadingRecipes(false);
      });
    })();

    return () => unsubscribe?.();
  }, [user]);

  // UI state voor filteren
  if (loading) {
    return <div className="text-center py-16">Laden...</div>;
  }
  if (!user) {
    return (
      <div>
        <RecipesHero />
        {/* … demo-sectie … */}
      </div>
    );
  }

  // Filteren (inclusief favorieten)
  const uid = user.uid;
  const categorieOpties = Array.from(new Set(recipes.flatMap(r => r.categorieen)));
  const gefilterdeRecipes = recipes.filter(recipe => {
    const q = zoekterm.trim().toLowerCase();
    const matchZoek =
      !zoekterm ||
      recipe.titel.toLowerCase().includes(q) ||
      recipe.ondertitel?.toLowerCase().includes(q) ||
      recipe.ingredienten.some(
        i => i.naam.toLowerCase().includes(q) || i.hoeveelheid.toLowerCase().includes(q)
      );
    const matchCat =
      geselecteerdeCategorieen.length === 0 ||
      recipe.categorieen.some(cat => geselecteerdeCategorieen.includes(cat));
    const matchFav = !favoritesOnly || (recipe.favoritedBy && recipe.favoritedBy.includes(uid));
    return matchZoek && matchCat && matchFav;
  });

  return (
    <div>
      <RecipesHero
        filterbar={
          <RecipeFilter
            categories={categorieOpties}
            onFilter={(search, cats, favOnly) => {
              setZoekterm(search);
              setGeselecteerdeCategorieen(cats);
              setFavoritesOnly(favOnly);
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
            {gefilterdeRecipes.map(r => (
              <RecipeCard
                key={r.id}
                id={r.id}
                title={r.titel}
                subtitle={r.ondertitel || ''}
                category={r.categorieen[0] || 'Onbekend'}
                cookingTime={r.bereidingsTijd}
                servings={r.aantalPersonen}
                image={r.afbeeldingUrl}
                isPrivate={r.privacy === 'prive'}
                isFavorited={r.favoritedBy?.includes(uid) ?? false}
                onClick={() => (window.location.href = `/recepten/${r.id}`)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
