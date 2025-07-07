'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipesHeroProps {
  onAddRecipe: () => void;
}

export default function RecipesHero({ onAddRecipe }: RecipesHeroProps) {
  return (
    <section className="py-16 bg-gradient-hero">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Onze Recepten Collectie</h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Ontdek heerlijke gerechten voor elke gelegenheid. Van snelle doordeweekse maaltijden tot
          feestelijke diners.
        </p>
        <Button
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          onClick={onAddRecipe}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nieuw Recept Toevoegen
        </Button>
      </div>
    </section>
  );
}
