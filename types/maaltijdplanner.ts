export type Category = 'Ontbijt' | 'Snack1' | 'Lunch' | 'Snack2' | 'Avondeten' | 'BakjeGeluk';
export type DayItem = { titel: string; boek: string; pagina: string };
export interface PlannerDay {
  dag: string; // bijv. "Zaterdag"
  datum: string; // bijv. "05"
  items: Record<Category, DayItem>;
}
