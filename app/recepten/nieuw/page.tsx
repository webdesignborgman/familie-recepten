'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { addRecipeToFirestore } from '@/lib/firebase';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  privacy: z.enum(['prive', 'publiek']),
});

type IngredientInput = { naam: string; hoeveelheid: string };
type RecipeFormData = z.infer<typeof recipeSchema>;

const categorieOpties = ['Ontbijt', 'Lunch', 'Diner', 'Nagerecht', 'Tussendoor', 'Soep', 'Anders'];

// Hulpfunctie: eerste letter hoofdletter, rest klein
function capitalizeFirstLetter(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Hulpfunctie: elk woord met hoofdletter (Titel)
function toTitleCase(str: string) {
  return str
    .split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
}

export default function NewRecipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { naam: '', hoeveelheid: '' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Voor automatisch focussen van inputs:
  const ingredientRefs = useRef<HTMLInputElement[]>([]);

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
  const addIngredient = () => {
    setIngredients(prev => [...prev, { naam: '', hoeveelheid: '' }]);
    setTimeout(() => {
      const nextIndex = ingredients.length * 2;
      ingredientRefs.current[nextIndex]?.focus();
    }, 20);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, key: 'naam' | 'hoeveelheid', value: string) => {
    const updated = [...ingredients];
    updated[index][key] = value;
    setIngredients(updated);
  };

  const handleIngredientNaamKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      ingredientRefs.current[index * 2 + 1]?.focus();
    }
  };

  const handleIngredientHoeveelheidKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  // Instruction handlers
  const addInstruction = () => setInstructions(prev => [...prev, '']);
  const removeInstruction = (index: number) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  // Handle image select
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (data: RecipeFormData) => {
    if (!user) {
      toast.error('Je moet ingelogd zijn om een recept toe te voegen.', { position: 'top-center' });
      return;
    }

    // Ingredients: alle namen met hoofdletter
    const filteredIngredients = ingredients
      .filter(i => i.naam.trim() !== '' && i.hoeveelheid.trim() !== '')
      .map(i => ({
        naam: capitalizeFirstLetter(i.naam.trim()),
        hoeveelheid: i.hoeveelheid.trim(), // hier evt. ook aanpassen?
      }));

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

    let imageUrl = '';
    try {
      // Upload afbeelding naar Firebase Storage indien geselecteerd
      if (selectedImage) {
        const storageRef = ref(storage, `recepten/${user.uid}/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(storageRef, selectedImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addRecipeToFirestore(
        {
          titel: toTitleCase(data.titel.trim()),
          ondertitel: data.ondertitel,
          categorieen: data.categorieen,
          ingredienten: filteredIngredients,
          bereidingswijze: filteredInstructions,
          afbeeldingUrl: imageUrl || '',
          beschrijving: data.beschrijving,
          privacy: data.privacy,
          bereidingsTijd: data.bereidingsTijd, // <-- toegevoegd!
          aantalPersonen: data.aantalPersonen, // <-- toegevoegd!
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
                <label className="font-medium">Afbeelding (optioneel)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="rounded-lg max-h-40 my-2 shadow" />
                )}
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
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Ingrediënt"
                        value={ingredient.naam}
                        onChange={e => updateIngredient(index, 'naam', e.target.value)}
                        className="flex-1"
                        disabled={loading}
                        ref={el => {
                          ingredientRefs.current[index * 2] = el!;
                        }}
                        onKeyDown={e => handleIngredientNaamKeyDown(e, index)}
                      />
                      <Input
                        placeholder="Hoeveelheid"
                        value={ingredient.hoeveelheid}
                        onChange={e => updateIngredient(index, 'hoeveelheid', e.target.value)}
                        className="w-32"
                        disabled={loading}
                        ref={el => {
                          ingredientRefs.current[index * 2 + 1] = el!;
                        }}
                        onKeyDown={e => handleIngredientHoeveelheidKeyDown(e, index)}
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
                <div className="space-y-2">
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
