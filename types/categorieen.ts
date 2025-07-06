// types/categorieen.ts

export const CATEGORIEEN = [
  'Ontbijt',
  'Lunch',
  'Hoofdgerecht',
  'Tussendoortje',
  'Dessert',
  'Soep',
  'Salade',
  'Toetje',
  'Anders',
] as const;

export type Categorie = (typeof CATEGORIEEN)[number];
