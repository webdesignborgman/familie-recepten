// components/boodschappenlijst/ShoppingListBanner.tsx

'use client';

import { useEffect, useState } from 'react';
import { ShoppingItem } from '@/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShoppingCart } from 'lucide-react';
import { Progress } from '@/components/ui/progress'; // shadcn/ui

type Props = { groupId: string };

export function ShoppingListBanner({ groupId }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'shoppingLists', groupId), snap => {
      setItems(snap.data()?.items ?? []);
    });
    return () => unsub();
  }, [groupId]);

  const checked = items.filter(i => i.checked).length;
  const total = items.length;
  const progress = total ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-gradient-hero border border-border p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-3">
        <ShoppingCart className="text-background" size={30} />
        <h1 className="text-2xl font-bold text-background">Boodschappenlijst</h1>
      </div>
      <div className="flex justify-between items-end mt-1 text-foreground text-sm">
        <span>{total} items</span>
        <span>{checked} afgerond</span>
      </div>
      <Progress value={progress} className="h-2 rounded-full">
        {/* geen indicatorClassName */}
      </Progress>
    </div>
  );
}
