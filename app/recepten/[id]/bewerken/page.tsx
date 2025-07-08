'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthProvider';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import type { Recept } from '@/types/index';
import Image from 'next/image';

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

// Hulpfuncties
function capitalizeFirstLetter(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function toTitleCase(str: string) {
  return str
    .split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
}

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { naam: '', hoeveelheid: '' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const ingredientRefs = useRef<HTMLInputElement[]>([]);

  // React Hook Form (leeg bij init)
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

  // Laad bestaand recept
  useEffect(() => {
    if (!id || !user) return;

    const fetchRecipe = async () => {
      setLoading(true);
      const ref = doc(db, 'recepten', id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Recept;
        form.reset({
          titel: data.titel,
          ondertitel: data.ondertitel || '',
          categorieen: data.categorieen || [],
          bereidingsTijd: data.bereidingsTijd || '',
          aantalPersonen: data.aantalPersonen || 1,
          afbeeldingUrl: data.afbeeldingUrl || '',
          beschrijving: data.beschrijving || '',
          privacy: data.privacy as 'prive' | 'publiek',
        });
        setIngredients(
          data.ingredienten?.length ? data.ingredienten : [{ naam: '', hoeveelheid: '' }]
        );
        setInstructions(data.bereidingswijze?.length ? data.bereidingswijze : ['']);
        setPreviewUrl(data.afbeeldingUrl || null);
      }
      setLoading(false);
    };

    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

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

  // Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Update recipe in Firestore
  const handleSubmit = async (data: RecipeFormData) => {
    if (!user) {
      toast.error('Je moet ingelogd zijn om een recept te bewerken.', { position: 'top-center' });
      return;
    }

    const filteredIngredients = ingredients
      .filter(i => i.naam.trim() !== '' && i.hoeveelheid.trim() !== '')
      .map(i => ({
        naam: capitalizeFirstLetter(i.naam.trim()),
        hoeveelheid: i.hoeveelheid.trim(),
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

    setSubmitLoading(true);

    let imageUrl = previewUrl || '';
    try {
      // Upload afbeelding indien aangepast
      if (selectedImage) {
        const sRef = storageRef(
          storage,
          `recepten/${user.uid}/${Date.now()}_${selectedImage.name}`
        );
        await uploadBytes(sRef, selectedImage);
        imageUrl = await getDownloadURL(sRef);
      }

      const updateData = {
        titel: toTitleCase(data.titel.trim()),
        ondertitel: data.ondertitel,
        categorieen: data.categorieen,
        ingredienten: filteredIngredients,
        bereidingswijze: filteredInstructions,
        afbeeldingUrl: imageUrl,
        beschrijving: data.beschrijving,
        privacy: data.privacy,
        bereidingsTijd: data.bereidingsTijd,
        aantalPersonen: data.aantalPersonen,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'recepten', id as string), updateData);
      toast.success('Recept succesvol bijgewerkt!');
      router.push(`/recepten/${id}`);
    } catch (err) {
      toast.error('Fout bij opslaan. Probeer het opnieuw.');
      console.error(err);
    }
    setSubmitLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[90vh]">
        <span className="text-muted-foreground">Laden...</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-gradient-hero py-12">
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl border-none bg-gradient-to-tr from-white via-[hsl(142,69%,58%)]/10 to-[hsl(210,100%,92%)] p-8">
        <h1 className="text-[hsl(142,76%,36%)] text-2xl mb-6 font-bold tracking-tight text-center">
          Recept Bewerken
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
                  disabled={submitLoading}
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
                  disabled={submitLoading}
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
                      disabled={submitLoading}
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
                    disabled={submitLoading}
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
                    disabled={submitLoading}
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
                  disabled={submitLoading}
                />
                {previewUrl && (
                  <div className="rounded-lg max-h-40 my-2 shadow relative w-full h-40">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                      sizes="320px"
                    />
                  </div>
                )}
              </div>
              {/* Beschrijving */}
              <div>
                <label className="font-medium">Beschrijving</label>
                <Textarea
                  {...form.register('beschrijving')}
                  placeholder="Beschrijf het gerecht..."
                  className="min-h-[100px] resize-none"
                  disabled={submitLoading}
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
                      disabled={submitLoading}
                    />
                    Privé
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="publiek"
                      checked={form.watch('privacy') === 'publiek'}
                      onChange={() => form.setValue('privacy', 'publiek')}
                      disabled={submitLoading}
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
                    disabled={submitLoading}
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
                        disabled={submitLoading}
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
                        disabled={submitLoading}
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
                          disabled={submitLoading}
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
                    disabled={submitLoading}
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
                        disabled={submitLoading}
                      />
                      {instructions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                          disabled={submitLoading}
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
              onClick={() => router.push(`/recepten/${id}`)}
              disabled={submitLoading}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
              disabled={submitLoading}
            >
              {submitLoading ? 'Opslaan...' : 'Wijzigingen Opslaan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
