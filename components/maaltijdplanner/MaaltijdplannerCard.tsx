'use client';
import { useState } from 'react';
import { PlannerDay, Category, DayItem } from '@/types/maaltijdplanner';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
// ...existing code...
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2, Save, X } from 'lucide-react';

const categories: Category[] = ['Ontbijt', 'Snack1', 'Lunch', 'Snack2', 'Avondeten', 'BakjeGeluk'];

const categoryColors: Record<Category, string> = {
  Ontbijt: 'bg-[#FFEDD5] text-[#9A3412]',
  Snack1: 'bg-green-100 text-green-700',
  Lunch: 'bg-[#DBEAFE] text-[#1E40AF]',
  Snack2: 'bg-green-100 text-green-700',
  Avondeten: 'bg-purple-100 text-purple-700',
  BakjeGeluk: 'bg-pink-100 text-pink-700',
};

interface Props {
  dayIndex: number;
  day: PlannerDay;
  updateDay: (index: number, day: PlannerDay) => Promise<void>;
  updateCategory: (index: number, category: Category, item: DayItem) => Promise<void>;
  clearCategory: (index: number, category: Category) => Promise<void>;
}

export default function MaaltijdplannerCard({
  dayIndex,
  day,
  updateDay,
  updateCategory,
  clearCategory,
}: Props) {
  const [editDatum, setEditDatum] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const { register, handleSubmit, reset } = useForm<DayItem>({
    defaultValues: { titel: '', boek: '', pagina: '' },
  });

  const handleDatumSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const datum = formData.get('datum') as string;
    setEditDatum(false);
    await updateDay(dayIndex, { ...day, datum });
  };

  const handleEditCat = (cat: Category) => {
    setEditCat(cat);
    reset(day.items[cat]);
  };

  const handleCatSave = async (data: DayItem) => {
    if (editCat) {
      await updateCategory(dayIndex, editCat, data);
      setEditCat(null);
    }
  };

  const handleCatCancel = () => {
    setEditCat(null);
  };

  const handleCatDelete = async (cat: Category) => {
    await clearCategory(dayIndex, cat);
    setEditCat(null);
  };

  return (
    <div className="bg-gradient-card rounded-xl shadow p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl font-bold text-foreground">{day.dag}</span>
        {editDatum ? (
          <form onSubmit={handleDatumSave} className="flex items-center gap-2">
            <Input
              name="datum"
              defaultValue={day.datum}
              className="w-14 text-black"
              maxLength={2}
            />
            <button
              type="submit"
              aria-label="Opslaan datum"
              className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:brightness-95 disabled:opacity-50 disabled:pointer-events-none shadow-soft h-9 px-4 py-1 text-sm bg-success text-white hover:bg-[#4ade80]"
            >
              <Save size={18} />
            </button>
            <button
              type="button"
              aria-label="Annuleren datum"
              onClick={() => setEditDatum(false)}
              className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:brightness-95 disabled:opacity-50 disabled:pointer-events-none shadow-soft h-9 px-4 py-1 text-sm bg-warning text-white hover:bg-[#fbbf24]"
            >
              <X size={18} />
            </button>
          </form>
        ) : (
          <>
            <span className="ml-2 text-lg font-mono px-2 py-1 rounded bg-secondaryVibrant text-black">
              {day.datum}
            </span>
            <button
              type="button"
              aria-label="Bewerk datum"
              onClick={() => setEditDatum(true)}
              className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:brightness-95 disabled:opacity-50 disabled:pointer-events-none shadow-soft h-9 px-4 py-1 text-sm bg-success text-white hover:bg-[#4ade80]"
            >
              <Pencil size={18} />
            </button>
          </>
        )}
      </div>
      <Separator className="mb-3" />
      <div className="flex flex-col gap-3">
        {categories.map(cat => (
          <div key={cat} className="bg-gradient-subtle rounded-lg shadow-sm p-3 mb-2 relative">
            <div
              className={`absolute left-2 top-2 px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[cat]}`}
            >
              {cat}
            </div>
            {editCat === cat ? (
              <form onSubmit={handleSubmit(handleCatSave)} className="flex flex-col gap-2 mt-6">
                <Input
                  {...register('titel')}
                  placeholder="Titel"
                  defaultValue={day.items[cat].titel}
                />
                <div className="flex gap-2">
                  <Input
                    {...register('boek')}
                    placeholder="Boek"
                    defaultValue={day.items[cat].boek}
                  />
                  <Input
                    {...register('pagina')}
                    placeholder="Pagina"
                    defaultValue={day.items[cat].pagina}
                    className="w-20"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    aria-label="Opslaan"
                    className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:brightness-95 disabled:opacity-50 disabled:pointer-events-none shadow-soft h-9 px-4 py-1 text-sm bg-success text-white hover:bg-[#4ade80]"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Annuleren"
                    onClick={handleCatCancel}
                    className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:brightness-95 disabled:opacity-50 disabled:pointer-events-none shadow-soft h-9 px-4 py-1 text-sm bg-warning text-white hover:bg-[#fbbf24]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-1 mt-6">
                <span className="font-semibold text-lg text-foreground">
                  {day.items[cat].titel || <span className="text-gray-400">(leeg)</span>}
                </span>
                <span className="text-sm text-gray-500">
                  {day.items[cat].boek ? (
                    `${day.items[cat].boek} - p.${day.items[cat].pagina}`
                  ) : (
                    <span className="text-gray-400">(geen boek/pagina)</span>
                  )}
                </span>
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    aria-label="Bewerk categorie"
                    onClick={() => handleEditCat(cat)}
                    className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:brightness-95 disabled:opacity-50 disabled:pointer-events-none shadow-soft h-9 px-4 py-1 text-sm bg-success text-white hover:bg-[#4ade80]"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Verwijder categorie"
                    onClick={() => {
                      if (window.confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) {
                        handleCatDelete(cat);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:brightness-95 disabled:opacity-50 disabled:pointer-events-none shadow-soft h-9 px-4 py-1 text-sm bg-warning text-white hover:bg-[#fbbf24]"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
