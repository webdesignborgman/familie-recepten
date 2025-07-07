'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const recipeSchema = z.object({
  title: z.string().min(1, 'Titel is verplicht'),
  subtitle: z.string().min(1, 'Ondertitel is verplicht'),
  category: z.string().min(1, 'Categorie is verplicht'),
  cookingTime: z.string().min(1, 'Bereidingstijd is verplicht'),
  servings: z.number().min(1, 'Aantal personen moet minimaal 1 zijn'),
  image: z.string().optional(),
  description: z.string().min(1, 'Beschrijving is verplicht'),
  isPrivate: z.boolean(), // <-- let op: verplicht
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RecipeFormData & { ingredients: string[]; instructions: string[] }) => void;
}

const categories = [
  'Pasta',
  'Soep',
  'Vis',
  'Dessert',
  'Aziatisch',
  'Italiaans',
  'Vlees',
  'Vegetarisch',
];

export default function RecipeFormModal({ open, onClose, onSubmit }: RecipeFormModalProps) {
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      category: '',
      cookingTime: '',
      servings: 1,
      image: '',
      description: '',
      isPrivate: false,
    },
  });

  // Ingredient & instruction handlers
  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index: number) =>
    setIngredients(
      ingredients.length > 1 ? ingredients.filter((_, i) => i !== index) : ingredients
    );
  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) =>
    setInstructions(
      instructions.length > 1 ? instructions.filter((_, i) => i !== index) : instructions
    );
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = (data: RecipeFormData) => {
    const filteredIngredients = ingredients.filter(i => i.trim() !== '');
    const filteredInstructions = instructions.filter(s => s.trim() !== '');
    if (!filteredIngredients.length) {
      toast({
        title: 'Fout',
        description: 'Voeg minimaal één ingrediënt toe.',
        variant: 'destructive',
      });
      return;
    }
    if (!filteredInstructions.length) {
      toast({
        title: 'Fout',
        description: 'Voeg minimaal één bereidingsstap toe.',
        variant: 'destructive',
      });
      return;
    }
    onSubmit({ ...data, ingredients: filteredIngredients, instructions: filteredInstructions });
    form.reset();
    setIngredients(['']);
    setInstructions(['']);
    onClose();
    toast({ title: 'Succes!', description: 'Recept succesvol toegevoegd.' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground text-left">
            Nieuw Recept Toevoegen
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel</FormLabel>
                      <FormControl>
                        <Input placeholder="Bijv. Spaghetti Carbonara" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ondertitel</FormLabel>
                      <FormControl>
                        <Input placeholder="Korte beschrijving van het gerecht" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer een categorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cookingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bereidingstijd</FormLabel>
                        <FormControl>
                          <Input placeholder="Bijv. 30 min" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="servings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aantal personen</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Afbeelding URL (optioneel)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschrijving</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Beschrijf het gerecht..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={form.watch('isPrivate')}
                    onChange={e => form.setValue('isPrivate', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-muted-foreground">
                    Privé recept (alleen zichtbaar voor mij)
                  </label>
                </div>
              </div>
              {/* Ingredients & Instructions */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-foreground">Ingrediënten</label>
                    <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                      <Plus className="w-4 h-4 mr-1" /> Toevoegen
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Ingrediënt ${index + 1}`}
                          value={ingredient}
                          onChange={e => updateIngredient(index, e.target.value)}
                          className="flex-1"
                        />
                        {ingredients.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeIngredient(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-foreground">Bereidingswijze</label>
                    <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
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
                        />
                        {instructions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeInstruction(index)}
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
              <Button type="button" variant="outline" onClick={onClose}>
                Annuleren
              </Button>
              <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                Recept Opslaan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
