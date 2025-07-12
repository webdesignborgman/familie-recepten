'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { X, Heart } from 'lucide-react';

interface RecipeFilterProps {
  categories: string[];
  onFilter: (search: string, selectedCategories: string[], favoritesOnly: boolean) => void;
}

export default function RecipeFilter({ categories, onFilter }: RecipeFilterProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    onFilter(search.trim(), selectedCategories, favoritesOnly);
  }, [search, selectedCategories, favoritesOnly, onFilter]);

  const clearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setFavoritesOnly(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Zoekveld */}
      <Input
        placeholder="Zoek recepten..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="flex-1"
      />

      {/* Categorie-filter */}
      <MultiSelectDropdown
        options={categories}
        value={selectedCategories}
        onChange={setSelectedCategories}
        placeholder="Filter categorieën"
      />

      {/* Favorieten-toggle */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={favoritesOnly ? 'Alleen favorieten aan' : 'Alle favorieten tonen'}
        onClick={() => setFavoritesOnly(fav => !fav)}
        className={`rounded-full border transition ${
          favoritesOnly ? 'bg-red-50 border-red-400' : 'bg-white'
        }`}
      >
        <Heart
          className={`w-5 h-5 ${favoritesOnly ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
        />
      </Button>

      {/* Reset-knop, klein */}
      {(search || selectedCategories.length > 0 || favoritesOnly) && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearAll}
          className="rounded-full ml-2"
          aria-label="Reset filters"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
