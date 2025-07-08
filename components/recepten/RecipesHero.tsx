'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function RecipesHero() {
  const { user } = useAuth();
  const router = useRouter();

  const handleAddRecipe = () => {
    if (!user) {
      toast.error('Log eerst in om een recept toe te voegen.', {
        position: 'top-center', // Zet de toast in het midden!
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

  return (
    <section className="py-16 bg-gradient-hero">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Mijn Recepten Collectie</h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Ontdek heerlijke gerechten voor elke gelegenheid. Van snelle doordeweekse maaltijden tot
          feestelijke diners.
        </p>
        <Button
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          onClick={handleAddRecipe}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nieuw Recept Toevoegen
        </Button>
      </div>
    </section>
  );
}
