// components/boodschappenlijst/ShoppingListAdd.tsx

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, AlertCircle, Tag } from 'lucide-react';
import { ShoppingItem, ShoppingCategory } from '@/types';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

type Props = { groupId: string };

export function ShoppingListAdd({ groupId }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [important, setImportant] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [promo, setPromo] = useState(false);
  const [category, setCategory] = useState<ShoppingCategory | ''>('');

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newItem: ShoppingItem = {
      id: uuidv4(),
      name: trimmed,
      checked: false,
      urgent: important,
      promo: promo,
      createdAt: Date.now(),
      ...(quantity.trim() && { quantity: quantity.trim() }),
      ...(category && { category }),
    };

    const docRef = doc(db, 'shoppingLists', groupId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        items: arrayUnion(newItem),
      });
    } else {
      await setDoc(docRef, {
        items: [newItem],
      });
    }

    setName('');
    setQuantity('');
    setImportant(false);
    setPromo(false);
    setCategory('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {/* Productnaam */}
      <Input
        ref={inputRef}
        placeholder="Naam van item"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[160px] order-1"
        aria-label="Naam van item"
      />
      {/* Aantal */}
      <Input
        placeholder="Aantal"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-24 order-2 sm:order-3"
        aria-label="Aantal"
      />
      {/* Categorie: mobiel volle breedte direct onder productnaam, desktop inline */}
      <select
        value={category}
        onChange={e => setCategory(e.target.value as ShoppingCategory | '')}
        className="border border-border rounded px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-40 order-3 sm:order-2"
        aria-label="Categorie"
      >
        <option value="">Categorie</option>
        <option value="Groente">Groente</option>
        <option value="Fruit">Fruit</option>
        <option value="Vlees">Vlees</option>
        <option value="Diepvries">Diepvries</option>
      </select>
      <Button
        type="button"
        variant={important ? 'destructive' : 'outline'}
        size="icon"
        className="transition border-0 order-4"
        aria-pressed={important}
        onClick={() => setImportant(v => !v)}
        title="Markeer als belangrijk"
      >
        <AlertCircle className={important ? '' : 'text-foreground'} size={30} />
      </Button>

      <Button
        type="button"
        variant="nostyle"
        size="icon"
        aria-pressed={promo}
        onClick={() => setPromo(v => !v)}
        title="Markeer als aanbieding"
        className={`
            transition border-0 order-5
            ${promo ? 'bg-[hsl(31,90%,65%)] text-white' : ''}
            hover:bg-orange-100
            focus:ring-orange-500
        `}
      >
        <Tag className={promo ? 'text-white' : 'text-[hsl(31,90%,65%)]'} size={26} />
      </Button>
      <Button
        type="button"
        variant="default"
        size="icon"
        onClick={handleAdd}
        aria-label="Toevoegen"
        className="order-6"
      >
        <Plus />
      </Button>
    </div>
  );
}
