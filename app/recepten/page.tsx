'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import RecipesHero from '@/components/recepten/RecipesHero';
import RecipeFormModal from '@/components/recepten/RecipeFormModal';
import { addRecipeToFirestore } from '@/lib/firebase';

export default function Page() {
  const { user, loading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (loading) return <div>Laden...</div>;

  return (
    <div>
      <RecipesHero onAddRecipe={() => setIsFormOpen(true)} />

      {/* Modaal recept-formulier */}
      <RecipeFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async values => {
          if (!user) return;
          await addRecipeToFirestore(values, user.uid); // let op: user.id vs user.uid
          setIsFormOpen(false);
        }}
      />

      {user ? (
        <div>{/* TODO: hier straks SearchFilterBar, StatsBar, RecipesGrid, etc */}</div>
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
