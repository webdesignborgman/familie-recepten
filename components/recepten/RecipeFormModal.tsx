'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const CATEGORIES = [
  'Hoofdgerecht',
  'Soep',
  'Bijgerecht',
  'Nagerecht',
  'Snack',
  'Italiaans',
  'Aziatisch',
  'Vis',
  'Dessert',
];

export interface RecipeFormValues {
  titel: string;
  ondertitel: string;
  categorieen: string[];
  bereidingstijd: number;
  aantalPersonen: number;
  afbeeldingUrl?: string;
  beschrijving: string;
  ingredienten: { naam: string; hoeveelheid: string }[];
  bereidingswijze: string[];
  privacy: 'prive' | 'publiek' | 'gedeeld';
}

interface RecipeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RecipeFormValues) => Promise<void>;
}

export default function RecipeFormModal({ open, onClose, onSubmit }: RecipeFormModalProps) {
  // Form state
  const [values, setValues] = useState<RecipeFormValues>({
    titel: '',
    ondertitel: '',
    categorieen: [],
    bereidingstijd: 30,
    aantalPersonen: 4,
    afbeeldingUrl: '',
    beschrijving: '',
    ingredienten: [{ naam: '', hoeveelheid: '' }],
    bereidingswijze: [''],
    privacy: 'prive',
  });
  const [saving, setSaving] = useState(false);

  // Helpers voor dynamische velden
  const handleIngrediëntChange = (idx: number, field: 'naam' | 'hoeveelheid', val: string) => {
    setValues(v => ({
      ...v,
      ingredienten: v.ingredienten.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    }));
  };

  const addIngrediënt = () => {
    setValues(v => ({
      ...v,
      ingredienten: [...v.ingredienten, { naam: '', hoeveelheid: '' }],
    }));
  };

  const removeIngrediënt = (idx: number) => {
    setValues(v => ({
      ...v,
      ingredienten: v.ingredienten.filter((_, i) => i !== idx),
    }));
  };

  const handleBereidingswijzeChange = (idx: number, val: string) => {
    setValues(v => ({
      ...v,
      bereidingswijze: v.bereidingswijze.map((step, i) => (i === idx ? val : step)),
    }));
  };

  const addBereidingsstap = () => {
    setValues(v => ({
      ...v,
      bereidingswijze: [...v.bereidingswijze, ''],
    }));
  };

  const removeBereidingsstap = (idx: number) => {
    setValues(v => ({
      ...v,
      bereidingswijze: v.bereidingswijze.filter((_, i) => i !== idx),
    }));
  };

  // Simple categories multiselect
  const handleCategorieToggle = (cat: string) => {
    setValues(v => ({
      ...v,
      categorieen: v.categorieen.includes(cat)
        ? v.categorieen.filter(c => c !== cat)
        : [...v.categorieen, cat],
    }));
  };

  // On submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      toast.success('Recept toegevoegd!');
      setValues({
        titel: '',
        ondertitel: '',
        categorieen: [],
        bereidingstijd: 30,
        aantalPersonen: 4,
        afbeeldingUrl: '',
        beschrijving: '',
        ingredienten: [{ naam: '', hoeveelheid: '' }],
        bereidingswijze: [''],
        privacy: 'prive',
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Opslaan mislukt. Probeer opnieuw!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nieuw Recept Toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Titel"
            value={values.titel}
            onChange={e => setValues(v => ({ ...v, titel: e.target.value }))}
            required
          />
          <Input
            placeholder="Ondertitel"
            value={values.ondertitel}
            onChange={e => setValues(v => ({ ...v, ondertitel: e.target.value }))}
          />
          <div>
            <label className="block mb-1 text-sm font-medium">Categorieën</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  type="button"
                  size="sm"
                  variant={values.categorieen.includes(cat) ? 'gradient' : 'outline'}
                  className={
                    values.categorieen.includes(cat)
                      ? 'bg-gradient-primary text-white border-none'
                      : ''
                  }
                  onClick={() => handleCategorieToggle(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Bereidingstijd (min)"
              value={values.bereidingstijd}
              onChange={e => setValues(v => ({ ...v, bereidingstijd: parseInt(e.target.value) }))}
              className="w-1/2"
              required
            />
            <Input
              type="number"
              min={1}
              placeholder="Aantal personen"
              value={values.aantalPersonen}
              onChange={e => setValues(v => ({ ...v, aantalPersonen: parseInt(e.target.value) }))}
              className="w-1/2"
              required
            />
          </div>
          <Input
            placeholder="Afbeelding URL (optioneel)"
            value={values.afbeeldingUrl || ''}
            onChange={e => setValues(v => ({ ...v, afbeeldingUrl: e.target.value }))}
          />
          <Textarea
            placeholder="Korte beschrijving"
            value={values.beschrijving}
            onChange={e => setValues(v => ({ ...v, beschrijving: e.target.value }))}
          />
          {/* Ingrediënten */}
          <div>
            <label className="block mb-1 text-sm font-medium">Ingrediënten</label>
            {values.ingredienten.map((ing, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  placeholder="Naam"
                  value={ing.naam}
                  onChange={e => handleIngrediëntChange(idx, 'naam', e.target.value)}
                  required
                />
                <Input
                  placeholder="Hoeveelheid"
                  value={ing.hoeveelheid}
                  onChange={e => handleIngrediëntChange(idx, 'hoeveelheid', e.target.value)}
                  required
                />
                {values.ingredienten.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeIngrediënt(idx)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-1"
              onClick={addIngrediënt}
            >
              + Ingrediënt
            </Button>
          </div>
          {/* Bereidingswijze */}
          <div>
            <label className="block mb-1 text-sm font-medium">Bereidingswijze</label>
            {values.bereidingswijze.map((stap, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Textarea
                  placeholder={`Stap ${idx + 1}`}
                  value={stap}
                  onChange={e => handleBereidingswijzeChange(idx, e.target.value)}
                  required
                />
                {values.bereidingswijze.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeBereidingsstap(idx)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-1"
              onClick={addBereidingsstap}
            >
              + Stap
            </Button>
          </div>
          {/* Privacy */}
          <div>
            <label className="block mb-1 text-sm font-medium">Privacy</label>
            <Select
              value={values.privacy}
              onValueChange={val =>
                setValues(v => ({ ...v, privacy: val as RecipeFormValues['privacy'] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prive">Privé</SelectItem>
                <SelectItem value="publiek">Publiek</SelectItem>
                <SelectItem value="gedeeld">Gedeeld</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full mt-2">
              Opslaan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
