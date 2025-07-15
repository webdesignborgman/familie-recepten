// app/boodschappenlijst/page.tsx

import { ShoppingListBanner } from '@/components/boodschappenlijst/ShoppingListBanner';
import { ShoppingListAdd } from '@/components/boodschappenlijst/ShoppingListAdd';
import { ShoppingListItems } from '@/components/boodschappenlijst/ShoppingListItems';

// Hier je Firestore groupId ophalen; hardcoded of via context/user
const groupId = 'familie'; // <--- aanpassen naar eigen situatie

export default function BoodschappenlijstPage() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <ShoppingListBanner groupId={groupId} />
      <div className="mt-6 mb-4">
        <ShoppingListAdd groupId={groupId} />
      </div>
      <ShoppingListItems groupId={groupId} />
    </main>
  );
}
