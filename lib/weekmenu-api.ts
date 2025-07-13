// lib/weekmenu-api.ts
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { WeekmenuDag } from '@/types';

// Altijd het hele dagen array opslaan:
export async function updateWeekmenuDagen(weekmenuId: string, dagen: WeekmenuDag[]) {
  await updateDoc(doc(db, 'weekmenus', weekmenuId), {
    dagen, // DIT is het array wat in Firestore komt te staan!
    updatedAt: new Date(),
  });
}
