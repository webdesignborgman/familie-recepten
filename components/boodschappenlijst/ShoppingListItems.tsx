// components/boodschappenlijst/ShoppingListItems.tsx

'use client';

import { useEffect, useState } from 'react';
import { ShoppingItem, ShoppingCategory } from '@/types';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingListItemCard } from './ShoppingListItemCard';
import { ShoppingListToolbar } from './ShoppingListToolbar';

type Props = { groupId: string };

export function ShoppingListItems({ groupId }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'shoppingLists', groupId), snap => {
      const data = snap.data()?.items ?? [];
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, [groupId]);

  // Sorteer op vaste categorie volgorde, daarna alfabetisch, en zet afgevinkte onderaan
  const categoryOrder: ShoppingCategory[] = ['Groente', 'Fruit', 'Vlees', 'Diepvries'];
  function categoryRank(cat?: ShoppingCategory) {
    if (!cat) return 999; // alles zonder categorie onderaan de niet-afgevinkte groep
    const idx = categoryOrder.indexOf(cat);
    return idx === -1 ? 998 : idx; // onbekend (zou niet moeten) vlak boven 'geen'
  }

  const sortedItems = [...items].sort((a, b) => {
    // Eerst: checked status (unchecked eerst)
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    // Dan: categorie rank
    const cr = categoryRank(a.category) - categoryRank(b.category);
    if (cr !== 0) return cr;
    // Dan: alfabetische naam
    return a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' });
  });

  async function toggleCheck(item: ShoppingItem) {
    const updated = cleanItem({ ...item, checked: !item.checked });
    await updateDoc(doc(db, 'shoppingLists', groupId), {
      items: arrayRemove(cleanItem(item)), // ook cleanen bij verwijderen!
    });
    await updateDoc(doc(db, 'shoppingLists', groupId), {
      items: arrayUnion(updated),
    });
  }

  async function remove(item: ShoppingItem) {
    await updateDoc(doc(db, 'shoppingLists', groupId), {
      items: arrayRemove(item),
    });
  }

  async function editItem(item: ShoppingItem, newName: string, newQuantity?: string) {
    const updated: ShoppingItem = {
      ...item,
      name: newName,
    };

    // Only add quantity if it's not empty and not '0'
    if (newQuantity && newQuantity.trim() !== '' && newQuantity !== '0') {
      updated.quantity = newQuantity.trim();
    } else {
      // Explicitly remove quantity if it exists
      delete updated.quantity;
    }

    await updateDoc(doc(db, 'shoppingLists', groupId), {
      items: arrayRemove(cleanItem(item)),
    });
    await updateDoc(doc(db, 'shoppingLists', groupId), {
      items: arrayUnion(cleanItem(updated)),
    });
  }

  function cleanItem(item: ShoppingItem): ShoppingItem {
    const cleaned = { ...item };
    if (
      cleaned.quantity === undefined ||
      cleaned.quantity === null ||
      cleaned.quantity === '' ||
      cleaned.quantity === '0'
    ) {
      delete cleaned.quantity;
    }
    return cleaned;
  }

  // ...imports...

  async function clearAll() {
    await updateDoc(doc(db, 'shoppingLists', groupId), { items: [] });
  }
  async function clearChecked() {
    const newItems = items.filter(i => !i.checked);
    await updateDoc(doc(db, 'shoppingLists', groupId), { items: newItems });
  }

  return (
    <div>
      <ShoppingListToolbar onClearAll={clearAll} onClearChecked={clearChecked} />
      {loading && <div className="py-10 text-center text-muted-foreground">Laden…</div>}
      {!loading && sortedItems.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">Nog geen boodschappen 🎉</div>
      )}
      <ul className="space-y-2">
        <AnimatePresence>
          {sortedItems.map(item => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <ShoppingListItemCard
                item={item}
                onToggleCheck={() => toggleCheck(item)}
                onDelete={() => remove(item)}
                onEdit={(newName, newQuantity) => editItem(item, newName, newQuantity)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
