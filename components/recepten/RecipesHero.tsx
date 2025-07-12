'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ReactNode } from 'react';
// Pas het import pad aan als je RecipeCardDemo op een andere plek hebt staan
import RecipeCardDemo from '@/components/recepten/RecipeCardDemo';

type RecipesHeroProps = {
  filterbar?: ReactNode;
};

export default function RecipesHero({ filterbar }: RecipesHeroProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleAddRecipe = () => {
    if (!user) {
      toast.error('Log eerst in om een recept toe te voegen.', {
        position: 'top-center',
        duration: 3500,
        description: (
          <span>
            <a
              href="/login"
              className="text-[hsl(210,100%,56%)] underline font-semibold hover:text-[hsl(142,76%,36%)]"
            >
              Inloggen
            </a>{' '}
            is verplicht om recepten toe te voegen.
          </span>
        ),
      });
      return;
    }
    router.push('/recepten/nieuw');
  };

  // Niet-ingelogd: Hero met demo, uitleg, CTA
  if (!user) {
    return (
      <section className="relative py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Familie Recepten
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Ontdek, bewaar en deel jouw favoriete gerechten met familie en vrienden.
            <br />
            <span className="font-semibold text-white/90">
              Maak nu een gratis account aan en begin direct!
            </span>
          </p>

          {/* Demo recepten cards */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <RecipeCardDemo
              title="Chocolade Bananenbrood"
              subtitle="Chocolade bananenbrood"
              category="Dessert"
              cookingTime="40"
              servings={2}
              image="/demo/bananenbrood.jpg"
              isPrivate
            />
            <RecipeCardDemo
              title="Italiaanse Pasta"
              subtitle="Met verse tomatensaus"
              category="Hoofdgerecht"
              cookingTime="25"
              servings={4}
              image="/demo/pasta.jpg"
              isPrivate={false}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mt-6">
            <a
              href="/register"
              className="px-8 py-3 rounded-xl font-bold bg-gradient-primary text-white shadow hover:opacity-90 transition"
            >
              Maak gratis account aan →
            </a>
            <span className="text-white/90 text-sm mt-2 sm:mt-0">
              Al een account?{' '}
              <a
                href="/login"
                className="underline text-green-800 hover:text-green-300 font-medium"
              >
                Inloggen
              </a>
            </span>
          </div>
        </div>
        {/* Kleine ruimte onder de hero voor responsiviteit */}
        <div className="h-8 md:h-12" />
      </section>
    );
  }

  // Wel ingelogd: Jouw bestaande hero
  return (
    <section className="relative py-16 bg-gradient-hero">
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Mijn Recepten Collectie</h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Ontdek heerlijke gerechten voor elke gelegenheid. Van snelle doordeweekse maaltijden tot
          feestelijke diners.
        </p>
        <Button
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm mb-10"
          onClick={handleAddRecipe}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nieuw Recept Toevoegen
        </Button>
      </div>
      {/* Filterbar floating card (mobiel: onder, desktop: half-overlappend) */}
      {filterbar && (
        <div
          className="
            max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto
            absolute left-1/2 transform -translate-x-1/2
            w-full
            px-1
            -bottom-5
            md:bottom-[-20px]
            z-20
            "
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="
              bg-white/95
              shadow-lg
              rounded-xl
              px-3 py-2
              flex flex-col sm:flex-row gap-2 items-center
              border border-border/30
              backdrop-blur-[2px]
            "
          >
            {filterbar}
          </div>
        </div>
      )}
      <div className="h-10 md:h-14" />
    </section>
  );
}
