'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { addRecipeToFirestore } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';

const recipeSchema = z.object({
  titel: z.string().min(1, 'Titel is verplicht'),
  ondertitel: z.string().min(1, 'Ondertitel is verplicht'),
  categorieen: z.array(z.string()).min(1, 'Kies minstens één categorie'),
  bereidingsTijd: z.string().min(1, 'Bereidingstijd is verplicht'),
  aantalPersonen: z.number().min(1, 'Aantal personen moet minimaal 1 zijn'),
  afbeeldingUrl: z.string().optional(),
  beschrijving: z.string().min(1, 'Beschrijving is verplicht'),
  privacy: z.enum(['prive', 'publiek', 'gedeeld']),
});

type IngredientInput = { naam: string; hoeveelheid: string };
type RecipeFormData = z.infer<typeof recipeSchema>;

const categorieOpties = [
  'Pasta',
  'Soep',
  'Vis',
  'Dessert',
  'Aziatisch',
  'Italiaans',
  'Vlees',
  'Vegetarisch',
];

export default function NewRecipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { naam: '', hoeveelheid: '' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      titel: '',
      ondertitel: '',
      categorieen: [],
      bereidingsTijd: '',
      aantalPersonen: 1,
      afbeeldingUrl: '',
      beschrijving: '',
      privacy: 'prive',
    },
  });

  // Ingredient handlers
  const addIngredient = () => setIngredients([...ingredients, { naam: '', hoeveelheid: '' }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  const updateIngredient = (index: number, key: 'naam' | 'hoeveelheid', value: string) => {
    const updated = [...ingredients];
    updated[index][key] = value;
    setIngredients(updated);
  };

  // Instruction handlers
  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (data: RecipeFormData) => {
    if (!user) {
      toast.error('Je moet ingelogd zijn om een recept toe te voegen.', { position: 'top-center' });
      return;
    }

    const filteredIngredients = ingredients.filter(
      i => i.naam.trim() !== '' && i.hoeveelheid.trim() !== ''
    );
    const filteredInstructions = instructions.filter(s => s.trim() !== '');

    if (!filteredIngredients.length) {
      toast.error('Voeg minimaal één ingrediënt toe (naam + hoeveelheid).', {
        position: 'top-center',
      });
      return;
    }
    if (!filteredInstructions.length) {
      toast.error('Voeg minimaal één bereidingsstap toe.', { position: 'top-center' });
      return;
    }

    setLoading(true);
    try {
      await addRecipeToFirestore(
        {
          titel: data.titel,
          ondertitel: data.ondertitel,
          categorieen: data.categorieen,
          ingredienten: filteredIngredients,
          bereidingswijze: filteredInstructions,
          afbeeldingUrl: data.afbeeldingUrl,
          beschrijving: data.beschrijving,
          privacy: data.privacy,
        },
        user.uid
      );
      toast.success('Recept succesvol toegevoegd!');
      router.push('/recepten');
    } catch (err) {
      toast.error('Fout bij opslaan. Probeer het opnieuw.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-gradient-hero py-12">
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl border-none bg-gradient-to-tr from-white via-[hsl(142,69%,58%)]/10 to-[hsl(210,100%,92%)] p-8">
        <h1 className="text-[hsl(142,76%,36%)] text-2xl mb-6 font-bold tracking-tight text-center">
          Nieuw Recept Toevoegen
        </h1>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10" autoComplete="off">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Linker kolom: Basisgegevens */}
            <div className="space-y-5">
              {/* Titel */}
              <div>
                <label className="font-medium">Titel</label>
                <Input
                  {...form.register('titel')}
                  placeholder="Bijv. Spaghetti Carbonara"
                  disabled={loading}
                />
                {form.formState.errors.titel && (
                  <div className="text-destructive text-xs">
                    {form.formState.errors.titel.message}
                  </div>
                )}
              </div>
              {/* Ondertitel */}
              <div>
                <label className="font-medium">Ondertitel</label>
                <Input
                  {...form.register('ondertitel')}
                  placeholder="Korte beschrijving van het gerecht"
                  disabled={loading}
                />
                {form.formState.errors.ondertitel && (
                  <div className="text-destructive text-xs">
                    {form.formState.errors.ondertitel.message}
                  </div>
                )}
              </div>
              {/* Categorieën (multi-select) */}
              <div>
                <label className="font-medium">Categorieën</label>
                <Controller
                  name="categorieen"
                  control={form.control}
                  render={({ field }) => (
                    <MultiSelectDropdown
                      value={field.value}
                      onChange={field.onChange}
                      options={categorieOpties}
                      disabled={loading}
                    />
                  )}
                />
                {form.formState.errors.categorieen && (
                  <div className="text-destructive text-xs">
                    {form.formState.errors.categorieen.message as string}
                  </div>
                )}
              </div>
              {/* Bereidingstijd & aantal personen */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Bereidingstijd</label>
                  <Input
                    {...form.register('bereidingsTijd')}
                    placeholder="Bijv. 30 min"
                    disabled={loading}
                  />
                  {form.formState.errors.bereidingsTijd && (
                    <div className="text-destructive text-xs">
                      {form.formState.errors.bereidingsTijd.message}
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-medium">Aantal personen</label>
                  <Input
                    type="number"
                    min="1"
                    {...form.register('aantalPersonen', { valueAsNumber: true })}
                    disabled={loading}
                  />
                  {form.formState.errors.aantalPersonen && (
                    <div className="text-destructive text-xs">
                      {form.formState.errors.aantalPersonen.message}
                    </div>
                  )}
                </div>
              </div>
              {/* Afbeelding */}
              <div>
                <label className="font-medium">Afbeelding URL (optioneel)</label>
                <Input
                  {...form.register('afbeeldingUrl')}
                  placeholder="https://..."
                  disabled={loading}
                />
              </div>
              {/* Beschrijving */}
              <div>
                <label className="font-medium">Beschrijving</label>
                <Textarea
                  {...form.register('beschrijving')}
                  placeholder="Beschrijf het gerecht..."
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                />
                {form.formState.errors.beschrijving && (
                  <div className="text-destructive text-xs">
                    {form.formState.errors.beschrijving.message}
                  </div>
                )}
              </div>
              {/* Privacy */}
              <div>
                <label className="font-medium block mb-1">Privacy</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="prive"
                      checked={form.watch('privacy') === 'prive'}
                      onChange={() => form.setValue('privacy', 'prive')}
                      disabled={loading}
                    />
                    Privé
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="publiek"
                      checked={form.watch('privacy') === 'publiek'}
                      onChange={() => form.setValue('privacy', 'publiek')}
                      disabled={loading}
                    />
                    Publiek
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="gedeeld"
                      checked={form.watch('privacy') === 'gedeeld'}
                      onChange={() => form.setValue('privacy', 'gedeeld')}
                      disabled={loading}
                    />
                    Gedeeld
                  </label>
                </div>
              </div>
            </div>
            {/* Rechter kolom: Ingrediënten & instructies */}
            <div className="space-y-8">
              {/* Ingrediënten */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-foreground">Ingrediënten</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIngredient}
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Toevoegen
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Ingrediënt"
                        value={ingredient.naam}
                        onChange={e => updateIngredient(index, 'naam', e.target.value)}
                        className="flex-1"
                        disabled={loading}
                      />
                      <Input
                        placeholder="Hoeveelheid"
                        value={ingredient.hoeveelheid}
                        onChange={e => updateIngredient(index, 'hoeveelheid', e.target.value)}
                        className="w-32"
                        disabled={loading}
                      />
                      {ingredients.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Instructies */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-foreground">Bereidingswijze</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInstruction}
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Stap toevoegen
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="w-8 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <Textarea
                        placeholder={`Stap ${index + 1}`}
                        value={instruction}
                        onChange={e => updateInstruction(index, e.target.value)}
                        className="flex-1 min-h-[80px] resize-none"
                        disabled={loading}
                      />
                      {instructions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/recepten')}
              disabled={loading}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Opslaan...' : 'Recept Opslaan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
