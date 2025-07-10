'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { X } from 'lucide-react';

interface RecipeFilterProps {
  categories: string[];
  onFilter: (search: string, selectedCategories: string[]) => void;
}

export default function RecipeFilter({ categories, onFilter }: RecipeFilterProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Debounced filter or instant?
  useEffect(() => {
    onFilter(search.trim(), selectedCategories);
  }, [search, selectedCategories]);

  const clearAll = () => {
    setSearch('');
    setSelectedCategories([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <Input
        placeholder="Zoek recepten..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="flex-1"
      />
      <MultiSelectDropdown
        options={categories}
        value={selectedCategories}
        onChange={setSelectedCategories}
        placeholder="Filter categorieën"
      />
      {(search || selectedCategories.length > 0) && (
        <Button variant="outline" className="flex items-center gap-2" onClick={clearAll}>
          <X className="w-4 h-4" /> Reset
        </Button>
      )}
    </div>
  );
}
