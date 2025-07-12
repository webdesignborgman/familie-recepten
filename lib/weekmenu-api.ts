// lib/weekmenu-api.ts

import type { WeekmenuDag } from '@/types';

/**
 * Updatet de dagen-array van een weekmenu in Firestore via je eigen API route.
 * @param weekmenuId Firestore document ID van het weekmenu
 * @param dagen Nieuwe array van WeekmenuDag
 */
export async function updateWeekmenuDagen(weekmenuId: string, dagen: WeekmenuDag[]): Promise<void> {
  await fetch(`/api/weekmenu/${weekmenuId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dagen }),
  });
}
